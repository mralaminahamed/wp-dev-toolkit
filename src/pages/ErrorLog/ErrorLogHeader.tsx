import React from "react";

interface ErrorLogHeaderProps {
  title: string;
  description: string;
}

const ErrorLogHeader: React.FC<ErrorLogHeaderProps> = ({
  title,
  description,
}) => (
  <div className="wdt:space-y-2">
    <h1 className="wdt:text-3xl wdt:font-bold">{title}</h1>
    <p className="wdt:text-muted-foreground">{description}</p>
  </div>
);

export default ErrorLogHeader;
