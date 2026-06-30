import React, { useEffect } from "react";

import { useLoading } from "@/context/LoadingContent";

const RouteSuspenseFallback: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading("route-chunk");
    return () => stopLoading("route-chunk");
  }, [startLoading, stopLoading]);

  return null;
};

export default RouteSuspenseFallback;