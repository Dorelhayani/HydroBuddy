/* ===== PlantStatus.js ===== */

import { useT } from "../../../../local/useT";
import { formatDateTime } from "../../../shared/domain/formatters";
import { useEsp } from "../../mod/hooks/useEsp";

export default function PumpStatus(){
  const { t } = useT();
  const { sensors, loading: espLoading, pollErr: wsError } = useEsp();

  const pump = sensors?.pump ?? { on: false, updatedAt: null };
  const statusText = wsError
    ? `WS Error: ${wsError}` : `${t("plants.pump")}: ${pump.on ? t("plants.on") : t("plants.off")}`;

  const when = pump.updatedAt ? formatDateTime(pump.updatedAt) : "-";

  return (
    <div className="pump-status" aria-busy={espLoading}>
      <span className={`pump-status__badge ${pump.on ? "is-on" : "is-off"}`}>
        <span className="pump-status__dot" /> {statusText}
      </span>
    </div>
  );
}