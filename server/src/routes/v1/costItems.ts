import { Router, Request, Response } from 'express';
import { verifyAuth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate, createCostItemSchema, updateCostItemSchema, costItemSearchSchema } from '../../middleware/validate.js';
import {
  categoriesRepository,
  costItemsRepository,
  subElementsRepository,
  unitsRepository,
} from '../../repositories/costRepository.js';
import logger from '../../utils/logger.js';

const router = Router();

/**
 * GET /api/v1/cost-items
 * Get all cost items
 * Supports query parameters for filtering
 */
router.get('/', verifyAuth, (req: Request, res: Response) => {
  try {
    // Get user from auth middleware
    const user = (req as any).user;

    // Allow specific database_type override if requested (for browsing alternative databases)
    // Otherwise, default to user's database type
    let databaseType = (req.query.database_type as string) || (user.is_witness ? 'witness' : 'standard_uk');

    // Validate query parameters
    const validatedQuery = costItemSearchSchema.parse(req.query);

    // Build filter object
    const filters: any = {
      databaseType, // Filter by specified or default database type
    };

    if (validatedQuery.searchTerm) {
      filters.searchTerm = validatedQuery.searchTerm;
    }
    if (validatedQuery.categoryId) {
      filters.categoryId = validatedQuery.categoryId;
    }
    if (validatedQuery.subElementId) {
      filters.subElementId = validatedQuery.subElementId;
    }
    if (validatedQuery.unitId) {
      filters.unitId = validatedQuery.unitId;
    }
    if (validatedQuery.region) {
      filters.region = validatedQuery.region;
    }
    if (validatedQuery.isContractorRequired !== undefined) {
      filters.isContractorRequired = validatedQuery.isContractorRequired === 'true';
    }

    // Use search if additional filters present, otherwise get all with database_type filter
    const costItems =
      Object.keys(filters).length > 1
        ? costItemsRepository.search(filters)
        : costItemsRepository.getAll(databaseType);

    res.json({
      success: true,
      data: costItems,
      count: costItems.length,
    });
  } catch (error: any) {
    logger.error(`Error fetching cost items: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost items',
    });
  }
});

/**
 * POST /api/v1/cost-items/import
 * Import cost items from bulk data (CSV/paste)
 * Requires: admin role only
 */
router.post(
  '/import',
  verifyAuth,
  authorize('admin'),
  (req: Request, res: Response) => {
    try {
      // Get user from auth middleware to determine database type
      const user = (req as any).user;
      const databaseType = user.is_witness ? 'witness' : 'standard_uk';

      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No items provided for import',
        });
        return;
      }

      // Validate each item has required fields
      const errors: any[] = [];
      const validItems: any[] = [];

      items.forEach((item: any, index: number) => {
        if (!item.pdCode || !item.description || item.amount === undefined) {
          errors.push({
            row: index + 1,
            field: 'required_fields',
            error: 'Missing required fields: pdCode, description, amount',
          });
          return;
        }

        if (typeof item.amount !== 'number' || item.amount <= 0) {
          errors.push({
            row: index + 1,
            field: 'amount',
            error: 'Amount must be a positive number',
          });
          return;
        }

        // Validate date format if provided
        if (item.recordedDate) {
          const dateObj = new Date(item.recordedDate);
          if (isNaN(dateObj.getTime())) {
            errors.push({
              row: index + 1,
              field: 'recordedDate',
              error: 'Invalid date format. Use YYYY-MM-DD',
            });
            return;
          }
        }

        validItems.push(item);
      });

      if (validItems.length === 0) {
        res.status(400).json({
          success: false,
          rowsProcessed: items.length,
          rowsSuccess: 0,
          rowsFailed: items.length,
          errors: errors,
          importedAt: new Date().toISOString(),
        });
        return;
      }

      // Get or create the "Imported Items" sub-element
      let importedSubElement = subElementsRepository.getByCode('IMPORT-001');
      if (!importedSubElement) {
        // Need to find the default category first (or create one)
        let defaultCategory = categoriesRepository.getByCode('IMPORT');
        if (!defaultCategory) {
          defaultCategory = categoriesRepository.create({
            code: 'IMPORT',
            name: 'Imported Items',
            description: 'Items imported from bulk upload',
            sort_order: 999,
          });
        }

        importedSubElement = subElementsRepository.create({
          category_id: defaultCategory.id,
          code: 'IMPORT-001',
          name: 'Bulk Import Items',
          description: 'Items imported from CSV/paste',
          sort_order: 999,
        });
      }

      // Get the default unit (assume 'item' exists, ID 1)
      const defaultUnit = unitsRepository.getByCode('item');
      if (!defaultUnit) {
        res.status(500).json({
          success: false,
          error: 'Default unit not found. Please contact administrator.',
        });
        return;
      }

      // Import items
      let successCount = 0;
      const importErrors: any[] = [];

      validItems.forEach((item: any, index: number) => {
        try {
          // Create full description with all available fields
          const fullDescription = [
            item.description,
            item.areaCode && `[Area: ${item.areaCode}]`,
            item.projectNumber && `[Project: ${item.projectNumber}]`,
          ]
            .filter(Boolean)
            .join(' ');

          const costItem = costItemsRepository.create({
            sub_element_id: importedSubElement.id,
            code: item.pdCode, // Use PD Code as the cost item code
            description: fullDescription,
            unit_id: defaultUnit.id,
            material_cost: item.amount,
            management_cost: 0,
            contractor_cost: 0,
            is_contractor_required: false,
            waste_factor: 1.0, // No waste factor for imported items
            currency: 'GBP',
            price_date: item.recordedDate || new Date().toISOString().split('T')[0],
            database_type: databaseType, // Tag with user's database type
          });

          logger.info(
            `Cost item imported: ${costItem.code} (${item.description}) by user ${req.user?.username}`
          );
          successCount++;
        } catch (error: any) {
          importErrors.push({
            row: index + 1,
            field: 'create',
            error: error.message || 'Failed to create cost item',
          });
        }
      });

      res.status(201).json({
        success: successCount === validItems.length,
        rowsProcessed: items.length,
        rowsSuccess: successCount,
        rowsFailed: importErrors.length + errors.length,
        errors: [...errors, ...importErrors],
        importedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error(`Error importing cost items: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to import cost items',
      });
    }
  }
);

/**
 * GET /api/v1/cost-items/:id
 * Get a specific cost item
 */
router.get('/:id', verifyAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const costItemId = parseInt(id, 10);

    if (isNaN(costItemId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid cost item ID',
      });
      return;
    }

    const costItem = costItemsRepository.getById(costItemId);

    if (!costItem) {
      res.status(404).json({
        success: false,
        error: 'Cost item not found',
      });
      return;
    }

    res.json({
      success: true,
      data: costItem,
    });
  } catch (error: any) {
    logger.error(`Error fetching cost item: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost item',
    });
  }
});

/**
 * GET /api/v1/cost-items/sub-element/:subElementId
 * Get all cost items for a specific sub-element
 */
router.get('/sub-element/:subElementId', verifyAuth, (req: Request, res: Response) => {
  try {
    const { subElementId } = req.params;
    const subElemId = parseInt(subElementId, 10);

    if (isNaN(subElemId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid sub-element ID',
      });
      return;
    }

    // Check if sub-element exists
    const subElement = subElementsRepository.getById(subElemId);
    if (!subElement) {
      res.status(404).json({
        success: false,
        error: 'Sub-element not found',
      });
      return;
    }

    const costItems = costItemsRepository.getBySubElementId(subElemId);

    res.json({
      success: true,
      data: costItems,
      count: costItems.length,
    });
  } catch (error: any) {
    logger.error(`Error fetching cost items by sub-element: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost items',
    });
  }
});

/**
 * GET /api/v1/cost-items/category/:categoryId
 * Get all cost items for a specific category
 */
router.get('/category/:categoryId', verifyAuth, (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const catId = parseInt(categoryId, 10);

    if (isNaN(catId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid category ID',
      });
      return;
    }

    const costItems = costItemsRepository.getByCategoryId(catId);

    res.json({
      success: true,
      data: costItems,
      count: costItems.length,
    });
  } catch (error: any) {
    logger.error(`Error fetching cost items by category: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cost items',
    });
  }
});

/**
 * POST /api/v1/cost-items
 * Create a new cost item
 * Requires: admin or estimator role
 */
router.post(
  '/',
  verifyAuth,
  authorize('admin', 'estimator'),
  validate(createCostItemSchema),
  (req: Request, res: Response) => {
    try {
      const {
        sub_element_id,
        code,
        description,
        unit_id,
        material_cost,
        management_cost,
        contractor_cost,
        is_contractor_required,
        volunteer_hours_estimated,
        waste_factor,
        currency,
        price_date,
        region,
      } = req.body;

      // Validate sub-element exists
      const subElement = subElementsRepository.getById(sub_element_id);
      if (!subElement) {
        res.status(404).json({
          success: false,
          error: 'Sub-element not found',
        });
        return;
      }

      // Validate unit exists
      const unit = unitsRepository.getById(unit_id);
      if (!unit) {
        res.status(404).json({
          success: false,
          error: 'Unit not found',
        });
        return;
      }

      // Validate that at least material_cost is provided
      if (
        material_cost === undefined ||
        material_cost === null ||
        (typeof material_cost === 'number' && material_cost <= 0)
      ) {
        res.status(400).json({
          success: false,
          error: 'Material cost must be greater than 0',
        });
        return;
      }

      const costItem = costItemsRepository.create({
        sub_element_id,
        code,
        description,
        unit_id,
        material_cost,
        management_cost,
        contractor_cost,
        is_contractor_required,
        volunteer_hours_estimated,
        waste_factor,
        currency,
        price_date,
        region,
      });

      logger.info(
        `Cost item created: ${costItem.code} (${unit.code}) by user ${req.user?.username}`
      );
      res.status(201).json({
        success: true,
        data: costItem,
      });
    } catch (error: any) {
      logger.error(`Error creating cost item: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to create cost item',
      });
    }
  }
);

/**
 * PUT /api/v1/cost-items/:id
 * Update a cost item
 * Requires: admin or estimator role
 */
router.put(
  '/:id',
  verifyAuth,
  authorize('admin', 'estimator'),
  validate(updateCostItemSchema),
  (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const costItemId = parseInt(id, 10);

      if (isNaN(costItemId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid cost item ID',
        });
        return;
      }

      // Check if cost item exists
      const existing = costItemsRepository.getById(costItemId);
      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Cost item not found',
        });
        return;
      }

      const {
        description,
        material_cost,
        management_cost,
        contractor_cost,
        is_contractor_required,
        volunteer_hours_estimated,
        waste_factor,
        region,
        price_date,
      } = req.body;

      const costItem = costItemsRepository.update(costItemId, {
        description,
        material_cost,
        management_cost,
        contractor_cost,
        is_contractor_required,
        volunteer_hours_estimated,
        waste_factor,
        region,
        price_date,
      });

      logger.info(`Cost item updated: ${costItem.code} by user ${req.user?.username}`);
      res.json({
        success: true,
        data: costItem,
      });
    } catch (error: any) {
      logger.error(`Error updating cost item: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to update cost item',
      });
    }
  }
);

/**
 * DELETE /api/v1/cost-items/:id
 * Delete a cost item
 * Requires: admin role
 */
router.delete('/:id', verifyAuth, authorize('admin'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const costItemId = parseInt(id, 10);

    if (isNaN(costItemId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid cost item ID',
      });
      return;
    }

    // Check if cost item exists
    const existing = costItemsRepository.getById(costItemId);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Cost item not found',
      });
      return;
    }

    const deleted = costItemsRepository.delete(costItemId);

    if (!deleted) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete cost item',
      });
      return;
    }

    logger.info(`Cost item deleted: ${existing.code} by user ${req.user?.username}`);
    res.json({
      success: true,
      message: 'Cost item deleted successfully',
    });
  } catch (error: any) {
    logger.error(`Error deleting cost item: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cost item',
    });
  }
});

export default router;
