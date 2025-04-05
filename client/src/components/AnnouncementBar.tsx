import { useABTest } from "@/lib/abTestContext";
import { useEffect } from "react";

interface AnnouncementBarProps {
  message: string;
}

export function AnnouncementBar({ message }: AnnouncementBarProps) {
  const { trackImpression } = useABTest();

  useEffect(() => {
    trackImpression('announcementBar', 'default');
  }, []);

  return (
    <div className="bg-primary text-white py-2 text-center text-sm">
      <p>{message}</p>
    </div>
  );
}

export default AnnouncementBar;
