import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyAuth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { projectEstimatesRepository, projectsRepository } from '../../repositories/projectRepository.js';
import { costItemsRepository } from '../../repositories/costRepository.js';
import { calculateProjectTotal } from '../../services/estimationEngine.js';
import logger from '../../utils/logger.js';

const router = Router();

// Validation schemas
const createEstimateSchema = z.object({
  cost_item_id: z.number().int().positive(),
  quantity: z.number().positive(),
  unit_cost_override: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

const updateEstimateSchema = z.object({
  quantity: z.number().positive().optional(),
  unit_cost_override: z.number().nonnegative().optional().nullable(),
  notes: z.string().max(500).optional(),
});

/**
 * GET /api/v1/projects/:projectId/estimates
 * Get all estimates for a project with calculations
 */
router.get('/:projectId/estimates', verifyAuth, (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const projectIdNum = parseInt(projectId, 10);

    if (isNaN(projectIdNum)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
      return;
    }

    // Check if project exists
    const project = projectsRepository.getById(projectIdNum);
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Check access - viewers can only see projects they created
    if (req.user?.role === 'viewer' && project.created_by !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Get estimates
    const estimates = projectEstimatesRepository.getAll(projectIdNum);

    // Get project totals
    let totals = null;
    try {
      totals = calculateProjectTotal(projectIdNum);
    } catch (error) {
      logger.warn(`Could not calculate project totals: ${error}`);
    }

    res.json({
      success: true,
      data: {
        project_id: projectIdNum,
        estimate_count: estimates.length,
        estimates,
        totals,
      },
    });
  } catch (error: any) {
    logger.error(`Error fetching project estimates: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch estimates',
    });
  }
});

/**
 * GET /api/v1/projects/:projectId/estimates/:id
 * Get specific estimate
 */
router.get('/:projectId/estimates/:id', verifyAuth, (req: Request, res: Response) => {
  try {
    const { projectId, id } = req.params;
    const projectIdNum = parseInt(projectId, 10);
    const estimateId = parseInt(id, 10);

    if (isNaN(projectIdNum) || isNaN(estimateId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID',
      });
      return;
    }

    // Check if project exists
    const project = projectsRepository.getById(projectIdNum);
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Check access
    if (req.user?.role === 'viewer' && project.created_by !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const estimate = projectEstimatesRepository.getById(estimateId);

    if (!estimate || estimate.project_id !== projectIdNum) {
      res.status(404).json({
        success: false,
        error: 'Estimate not found',
      });
      return;
    }

    res.json({
      success: true,
      data: estimate,
    });
  } catch (error: any) {
    logger.error(`Error fetching estimate: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch estimate',
    });
  }
});

/**
 * POST /api/v1/projects/:projectId/estimates
 * Add cost item to project estimate
 * Requires: admin or estimator role
 */
router.post(
  '/:projectId/estimates',
  verifyAuth,
  authorize('admin', 'estimator'),
  validate(createEstimateSchema),
  (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const projectIdNum = parseInt(projectId, 10);

      if (isNaN(projectIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project ID',
        });
        return;
      }

      // Check if project exists
      const project = projectsRepository.getById(projectIdNum);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      // Check authorization
      if (req.user?.role !== 'admin' && project.created_by !== req.user?.userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      const { cost_item_id, quantity, unit_cost_override, notes } = req.body;

      // Check if cost item exists
      const costItem = costItemsRepository.getById(cost_item_id);
      if (!costItem) {
        res.status(404).json({
          success: false,
          error: 'Cost item not found',
        });
        return;
      }

      // Calculate line total
      const materialCost = unit_cost_override || costItem.material_cost;
      const materialTotal = materialCost * quantity * costItem.waste_factor;
      const managementTotal = costItem.management_cost * quantity;
      const contractorTotal = costItem.is_contractor_required ? costItem.contractor_cost * quantity : 0;
      const lineTotal = materialTotal + managementTotal + contractorTotal;

      // Create estimate
      const estimate = projectEstimatesRepository.create({
        project_id: projectIdNum,
        cost_item_id,
        quantity,
        unit_cost_override,
        notes,
        line_total: lineTotal,
        created_by: req.user!.userId,
      });

      logger.info(
        `Estimate added to project ${projectIdNum}: ${costItem.code} x${quantity} by user ${req.user?.username}`
      );

      res.status(201).json({
        success: true,
        data: estimate,
      });
    } catch (error: any) {
      logger.error(`Error creating estimate: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to add estimate',
      });
    }
  }
);

/**
 * PUT /api/v1/projects/:projectId/estimates/:id
 * Update estimate line item
 * Requires: admin or estimator role
 */
router.put(
  '/:projectId/estimates/:id',
  verifyAuth,
  authorize('admin', 'estimator'),
  validate(updateEstimateSchema),
  (req: Request, res: Response) => {
    try {
      const { projectId, id } = req.params;
      const projectIdNum = parseInt(projectId, 10);
      const estimateId = parseInt(id, 10);

      if (isNaN(projectIdNum) || isNaN(estimateId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }

      // Check if project exists
      const project = projectsRepository.getById(projectIdNum);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      // Check authorization
      if (req.user?.role !== 'admin' && project.created_by !== req.user?.userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      // Check if estimate exists
      const existing = projectEstimatesRepository.getById(estimateId);
      if (!existing || existing.project_id !== projectIdNum) {
        res.status(404).json({
          success: false,
          error: 'Estimate not found',
        });
        return;
      }

      const { quantity, unit_cost_override, notes } = req.body;

      // Recalculate line total if quantity changed
      let lineTotal = existing.line_total ?? 0;
      if (quantity !== undefined || unit_cost_override !== undefined) {
        const costItem = costItemsRepository.getById(existing.cost_item_id);
        if (costItem) {
          const qty = quantity || existing.quantity;
          const unitCost = unit_cost_override !== undefined ? unit_cost_override : costItem.material_cost;
          const materialTotal = unitCost * qty * costItem.waste_factor;
          const managementTotal = costItem.management_cost * qty;
          const contractorTotal = costItem.is_contractor_required
            ? costItem.contractor_cost * qty
            : 0;
          lineTotal = materialTotal + managementTotal + contractorTotal;
        }
      }

      const estimate = projectEstimatesRepository.update(estimateId, {
        quantity,
        unit_cost_override,
        notes,
        line_total: lineTotal,
      });

      logger.info(`Estimate updated: ID ${estimateId} by user ${req.user?.username}`);

      res.json({
        success: true,
        data: estimate,
      });
    } catch (error: any) {
      logger.error(`Error updating estimate: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to update estimate',
      });
    }
  }
);

/**
 * DELETE /api/v1/projects/:projectId/estimates/:id
 * Delete estimate line item
 * Requires: admin or estimator role
 */
router.delete(
  '/:projectId/estimates/:id',
  verifyAuth,
  authorize('admin', 'estimator'),
  (req: Request, res: Response) => {
    try {
      const { projectId, id } = req.params;
      const projectIdNum = parseInt(projectId, 10);
      const estimateId = parseInt(id, 10);

      if (isNaN(projectIdNum) || isNaN(estimateId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }

      // Check if project exists
      const project = projectsRepository.getById(projectIdNum);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      // Check authorization
      if (req.user?.role !== 'admin' && project.created_by !== req.user?.userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      // Check if estimate exists
      const existing = projectEstimatesRepository.getById(estimateId);
      if (!existing || existing.project_id !== projectIdNum) {
        res.status(404).json({
          success: false,
          error: 'Estimate not found',
        });
        return;
      }

      const deleted = projectEstimatesRepository.delete(estimateId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete estimate',
        });
        return;
      }

      logger.info(`Estimate deleted: ID ${estimateId} from project ${projectIdNum} by user ${req.user?.username}`);

      res.json({
        success: true,
        message: 'Estimate deleted successfully',
      });
    } catch (error: any) {
      logger.error(`Error deleting estimate: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to delete estimate',
      });
    }
  }
);

/**
 * GET /api/v1/projects/:projectId/estimate-summary
 * Get complete estimate calculation with breakdown
 */
router.get('/:projectId/estimate-summary', verifyAuth, (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const projectIdNum = parseInt(projectId, 10);

    if (isNaN(projectIdNum)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
      return;
    }

    const project = projectsRepository.getById(projectIdNum);
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Check access
    if (req.user?.role === 'viewer' && project.created_by !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const totals = calculateProjectTotal(projectIdNum);

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          client_id: project.client_id,
          budget_cost: project.budget_cost,
          start_date: project.start_date,
        },
        estimate: totals,
      },
    });
  } catch (error: any) {
    logger.error(`Error calculating estimate summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate estimate',
    });
  }
});

export default router;
