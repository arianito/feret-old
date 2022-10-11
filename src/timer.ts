import { metadata, metadataOf, TimerOptions } from "./metadata";

/**
 * Decorate members to be fired intervally
 * @param ms define time interval
 * @param options extra options
 * @returns 
 */
export function timer(ms: number, options?: Partial<TimerOptions>) {
	return function (target: any, key: string) {
		const {timers = []} = metadataOf(target);
		metadata(target, {
			timers: [
				...timers,
				{key, ms, options}
			],
		});
	}
}