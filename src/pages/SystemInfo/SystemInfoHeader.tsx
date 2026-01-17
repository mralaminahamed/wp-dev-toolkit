import React from "react";

interface SystemInfoHeaderProps {
  title: string;
  description: string;
}

const SystemInfoHeader: React.FC<SystemInfoHeaderProps> = ({
  title,
  description,
}) => (
  <div className="wdt:space-y-2">
    <h1 className="wdt:text-3xl wdt:font-bold">{title}</h1>
    <p className="wdt:text-muted-foreground">{description}</p>
  </div>
);

export default SystemInfoHeader;
