<?php
// Load WordPress
require_once('wp-load.php');

// Make sure Action Scheduler is loaded
if (!class_exists('ActionScheduler_QueueRunner')) {
    return;
}

// Set the memory limit and max execution time
ini_set('memory_limit', '512M');
set_time_limit(0);

// Get the queue runner instance
$runner = ActionScheduler_QueueRunner::instance();

// Set the number of actions to process in each batch
$batch_size = 100;

// Process actions in batches
$processed_actions = 0;
do {
    $actions_processed = $runner->run(array(
        'batch_size' => $batch_size,
    ));
    $processed_actions += $actions_processed;
    
    echo "Processed $actions_processed actions. Total: $processed_actions\n";
    
    // Optional: Add a small delay between batches to prevent overload
    usleep(100000); // 100ms delay
} while ($actions_processed > 0);

echo "Finished processing all pending actions. Total processed: $processed_actions\n";
