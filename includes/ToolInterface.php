<?php

// src/Core/ToolInterface.php
namespace WPDevToolkit;

interface ToolInterface {
    public function init();
    public function register_rest_routes();
}