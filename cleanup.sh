#!/bin/bash

# Script to clean up old files after the WP Dev Toolkit reorganization
echo "Cleaning up old files after directory reorganization..."

# Remove API directory files (now replaced by Rest/Controllers)
echo "Removing API directory files..."
rm -f includes/API/*.php

# Remove empty API directory
echo "Removing API directory..."
rmdir includes/API/

echo "Cleanup completed successfully!"
