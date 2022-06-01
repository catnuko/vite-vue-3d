import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export { dayjs, Dayjs, duration };
