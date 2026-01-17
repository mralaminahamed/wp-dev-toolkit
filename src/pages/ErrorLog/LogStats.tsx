import React from "react";
import { Database, AlertTriangle, Clock, Info, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LogStatsProps {
  stats: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    debug: number;
    other: number;
  };
  fileSize: number;
  formatFileSize: (bytes: number) => string;
}

const LogStats: React.FC<LogStatsProps> = ({
  stats,
  fileSize,
  formatFileSize,
}) => (
  <div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-5 wdt:mb-6">
    <Card>
      <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
        <CardTitle className="wdt:text-sm wdt:font-medium">
          Total Logs
        </CardTitle>
        <Database className="wdt:text-2xl" />
      </CardHeader>
      <CardContent>
        <div className="wdt:text-2xl wdt:font-bold">{stats.total}</div>
        <p className="wdt:text-xs wdt:text-muted-foreground">All log entries</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
        <CardTitle className="wdt:text-sm wdt:font-medium">Errors</CardTitle>
        <AlertTriangle className="wdt:text-2xl wdt:text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="wdt:text-2xl wdt:font-bold wdt:text-red-600">
          {stats.errors}
        </div>
        <p className="wdt:text-xs wdt:text-muted-foreground">Critical issues</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
        <CardTitle className="wdt:text-sm wdt:font-medium">Warnings</CardTitle>
        <Clock className="wdt:text-2xl wdt:text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="wdt:text-2xl wdt:font-bold wdt:text-yellow-600">
          {stats.warnings}
        </div>
        <p className="wdt:text-xs wdt:text-muted-foreground">
          Potential issues
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
        <CardTitle className="wdt:text-sm wdt:font-medium">Info</CardTitle>
        <Info className="wdt:text-2xl wdt:text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="wdt:text-2xl wdt:font-bold wdt:text-blue-600">
          {stats.info}
        </div>
        <p className="wdt:text-xs wdt:text-muted-foreground">Informational</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
        <CardTitle className="wdt:text-sm wdt:font-medium">File Size</CardTitle>
        <FileText className="wdt:text-2xl wdt:text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="wdt:text-2xl wdt:font-bold">
          {formatFileSize(fileSize)}
        </div>
        <p className="wdt:text-xs wdt:text-muted-foreground">Log file size</p>
      </CardContent>
    </Card>
  </div>
);

export default LogStats;
