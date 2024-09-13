<?php

namespace WPDevToolkit\Tools;

interface ToolInterface {
    public function init();
    public function register_rest_routes();
}