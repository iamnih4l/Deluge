import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";
import { ReplayControls } from "@/components/ui/ReplayControls";

export default function HistoricalReplayPage() {
  return (
    <CommandCenterLayout 
      showTimeline={true} 
      timelineContent={<ReplayControls />} 
    />
  );
}
