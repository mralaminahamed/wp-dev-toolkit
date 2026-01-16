import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Database,
  Link as LinkIcon,
  Terminal,
  Info,
  Settings,
  BarChart,
  Check,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  const tools = [
    {
      id: "error-log",
      name: "Error Log",
      description: "Monitor PHP errors and exceptions",
      icon: FileText,
      status: "active",
    },
    {
      id: "query-monitor",
      name: "Query Monitor",
      description: "Track database queries and performance",
      icon: Database,
      status: "active",
    },
    {
      id: "hook-inspector",
      name: "Hook Inspector",
      description: "Inspect WordPress hooks and filters",
      icon: LinkIcon,
      status: "active",
    },
    {
      id: "terminal",
      name: "Terminal",
      description: "Command-line interface for WordPress",
      icon: Terminal,
      status: "active",
    },
    {
      id: "system-info",
      name: "System Info",
      description: "Server and WordPress system information",
      icon: Info,
      status: "active",
    },
    {
      id: "settings",
      name: "Settings",
      description: "Configure WP Dev Toolkit options",
      icon: Settings,
      status: "available",
    },
  ];

  return (
    <div className="wdt:space-y-6 wdt:p-6">
      {/* Header */}
      <div className="wdt:space-y-2">
        <h1 className="wdt:text-3xl wdt:font-bold">WP Dev Toolkit Dashboard</h1>
        <p className="wdt:text-muted-foreground">
          Monitor and manage your WordPress development tools
        </p>
      </div>

      {/* Stats Cards */}
      <div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-3">
        <Card>
          <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
            <CardTitle className="wdt:text-sm wdt:font-medium">
              Active Tools
            </CardTitle>
            <BarChart className="wdt:text-2xl" />
          </CardHeader>
          <CardContent>
            <div className="wdt:text-2xl wdt:font-bold">
              {tools.filter((t) => t.status === "active").length}
            </div>
            <p className="wdt:text-xs wdt:text-muted-foreground">
              Development tools enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
            <CardTitle className="wdt:text-sm wdt:font-medium">
              System Status
            </CardTitle>
            <Check className="wdt:text-2xl" />
          </CardHeader>
          <CardContent>
            <div className="wdt:text-2xl wdt:font-bold">Healthy</div>
            <p className="wdt:text-xs wdt:text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
            <CardTitle className="wdt:text-sm wdt:font-medium">
              WordPress
            </CardTitle>
            <Target className="wdt:text-2xl" />
          </CardHeader>
          <CardContent>
            <div className="wdt:text-2xl wdt:font-bold">6.4+</div>
            <p className="wdt:text-xs wdt:text-muted-foreground">
              Compatible version
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="wdt:space-y-4">
        <h2 className="wdt:text-xl wdt:font-semibold">Available Tools</h2>
        <div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-2 lg:wdt:grid-cols-3">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="wdt:hover:shadow-lg wdt:transition-shadow"
            >
              <CardHeader>
                <div className="wdt:flex wdt:items-center wdt:justify-between">
                  <div className="wdt:flex wdt:items-center wdt:space-x-2">
                    <tool.icon className="wdt:text-2xl" />
                    <CardTitle className="wdt:text-lg">{tool.name}</CardTitle>
                  </div>
                  <Badge
                    variant={tool.status === "active" ? "default" : "secondary"}
                  >
                    {tool.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="wdt:text-sm wdt:text-muted-foreground wdt:mb-4">
                  {tool.description}
                </p>
                <Link to={`/${tool.id}`}>
                  <Button className="wdt:w-full">Open {tool.name}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
