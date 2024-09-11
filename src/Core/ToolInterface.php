<?php

// src/Core/ToolInterface.php
namespace WPDevToolkit\Core;

interface ToolInterface {
    public function init();
    public function register_rest_routes();
}