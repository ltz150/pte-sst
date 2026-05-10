import { WfdPlayer } from "@/components/wfd-player";
import { readLatestWfdData } from "@/lib/wfd/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dataset = await readLatestWfdData();

  return <WfdPlayer dataset={dataset} />;
}
