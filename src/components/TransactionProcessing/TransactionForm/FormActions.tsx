
import { Button } from "@/components/ui/button";
import React from "react";

export function FormActions({ loading, onClose }: { loading: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Recording..." : "Record Transaction"}
      </Button>
    </div>
  );
}
