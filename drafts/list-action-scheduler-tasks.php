<?php
// Load WordPress
require_once('wp-load.php');

// Make sure Action Scheduler is loaded
if (!class_exists('ActionScheduler')) {
    die('Action Scheduler is not available.');
}

// Set the memory limit and max execution time
ini_set('memory_limit', '256M');
set_time_limit(300);

// Function to get human-readable time difference
function human_time_diff_custom($from, $to = '') {
    if (empty($to)) {
        $to = time();
    }
    $diff = (int) abs($to - $from);

    if ($diff < HOUR_IN_SECONDS) {
        $mins = round($diff / MINUTE_IN_SECONDS);
        $since = sprintf(_n('%s minute', '%s minutes', $mins), $mins);
    } elseif ($diff < DAY_IN_SECONDS && $diff >= HOUR_IN_SECONDS) {
        $hours = round($diff / HOUR_IN_SECONDS);
        $since = sprintf(_n('%s hour', '%s hours', $hours), $hours);
    } elseif ($diff < WEEK_IN_SECONDS && $diff >= DAY_IN_SECONDS) {
        $days = round($diff / DAY_IN_SECONDS);
        $since = sprintf(_n('%s day', '%s days', $days), $days);
    } elseif ($diff < MONTH_IN_SECONDS && $diff >= WEEK_IN_SECONDS) {
        $weeks = round($diff / WEEK_IN_SECONDS);
        $since = sprintf(_n('%s week', '%s weeks', $weeks), $weeks);
    } elseif ($diff < YEAR_IN_SECONDS && $diff >= MONTH_IN_SECONDS) {
        $months = round($diff / MONTH_IN_SECONDS);
        $since = sprintf(_n('%s month', '%s months', $months), $months);
    } elseif ($diff >= YEAR_IN_SECONDS) {
        $years = round($diff / YEAR_IN_SECONDS);
        $since = sprintf(_n('%s year', '%s years', $years), $years);
    }

    return $since;
}

// Get all actions
$store = ActionScheduler::store();
$actions = $store->query_actions(array(
    'per_page' => -1,
    'orderby' => 'date',
    'order' => 'ASC',
));

// Prepare the output
$output = "Action Scheduler Tasks:\n\n";
$output .= str_pad("ID", 6) . str_pad("Hook", 30) . str_pad("Status", 12) . str_pad("Scheduled Date", 20) . "Args\n";
$output .= str_repeat("-", 100) . "\n";

foreach ($actions as $action_id) {
    $action = $store->fetch_action($action_id);
    $status = $store->get_status($action_id);
    $schedule_date = $store->get_date($action_id)->format('Y-m-d H:i:s');
    $hook = $action->get_hook();
    $args = json_encode($action->get_args());

    if ($status === 'pending') {
        $time_diff = human_time_diff_custom(strtotime($schedule_date));
        $schedule_info = "In $time_diff";
    } elseif ($status === 'complete') {
        $time_diff = human_time_diff_custom(strtotime($schedule_date), current_time('timestamp'));
        $schedule_info = "$time_diff ago";
    } else {
        $schedule_info = $schedule_date;
    }

    $output .= str_pad($action_id, 6) . 
               str_pad(substr($hook, 0, 28), 30) . 
               str_pad($status, 12) . 
               str_pad($schedule_info, 20) . 
               substr($args, 0, 30) . (strlen($args) > 30 ? '...' : '') . "\n";
}

// Output the result
echo $output;
