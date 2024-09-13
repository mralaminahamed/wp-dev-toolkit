<?php
namespace WPDevToolkit\Tools;

class ToolFactory {
    private $tools = [];

    public function register($name, $class) {
        $this->tools[$name] = $class;
    }

    public function create($name) {
        if (!isset($this->tools[$name])) {
            throw new \Exception("Unknown tool: $name");
        }

        $class = $this->tools[$name];
        return new $class();
    }
}
