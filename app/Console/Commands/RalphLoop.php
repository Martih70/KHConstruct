<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RalphLoop extends Command
{
    protected $signature = 'ralph:loop {iterations=10}';
    protected $description = 'The classic Ralph Wiggum infinite loop';

    public function handle()
    {
        $iterations = $this->argument('iterations');
        
        for ($i = 0; $i < $iterations; $i++) {
            $this->line("I'm in danger! (iteration " . ($i + 1) . ")");
            sleep(1);
        }
        
        $this->info('Danger averted!');
    }
}
