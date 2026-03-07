<script lang="ts">
	import type { Log } from '$lib/entities/logs/types';

	type Props = {
		logs: Log[];
	};

	let { logs }: Props = $props();

	const chartData = $derived.by(() => {
		const chronological = [...(logs ?? [])].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);
		return chronological.map((log) => {
			const volume = log.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
			return {
				date: log.createdAt,
				volume
			};
		});
	});

	const maxVolume = $derived(
		chartData.length > 0 ? Math.max(...chartData.map((d) => d.volume), 1) : 1
	);

	// 2 units width per point in viewBox → 2rem per point when rendered
	const widthPerPoint = 2;
	const chartHeight = 20;
	const paddingX = 0.5;
	const paddingY = 0.5;

	const chartWidth = $derived(Math.max(widthPerPoint, chartData.length * widthPerPoint));
	const plotWidth = $derived(chartWidth - paddingX * 2);
	const plotHeight = $derived(chartHeight - paddingY * 2);

	const points = $derived(
		chartData.map((d, i) => {
			const n = chartData.length;
			const x = paddingX + (n > 1 ? (i / (n - 1)) * plotWidth : plotWidth / 2);
			const y = paddingY + plotHeight - (d.volume / maxVolume) * plotHeight;
			return { x, y, ...d };
		})
	);

	const linePath = $derived.by(() => {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
		// Catmull-Rom to cubic Bezier with low tension for a very smooth curve
		const tension = 0.1;
		let path = `M ${points[0].x} ${points[0].y}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[Math.max(0, i - 1)];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[Math.min(points.length - 1, i + 2)];
			const cp1x = p1.x + (p2.x - p0.x) * tension;
			const cp1y = p1.y + (p2.y - p0.y) * tension;
			const cp2x = p2.x - (p3.x - p1.x) * tension;
			const cp2y = p2.y - (p3.y - p1.y) * tension;
			path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
		}
		return path;
	});
</script>

{#if chartData.length < 2}
	<p class="empty-state">Not enough data to show a chart.</p>
{:else}
	<div class="chart" role="img" aria-label="Volume per session line chart">
		<svg
			class="line-chart"
			viewBox="0 0 {chartWidth} {chartHeight}"
			style="width: {chartWidth}rem; height: {chartHeight}rem;"
			preserveAspectRatio="xMinYMid meet"
			aria-hidden="true"
		>
			<path class="line" d={linePath} fill="none" />
			{#each points as point (point.date)}
				<circle class="dot" cx={point.x} cy={point.y} r="0.4"></circle>
			{/each}
		</svg>
	</div>
{/if}

<style>
	.empty-state {
		font-size: 1.4rem;
		color: var(--neutral-11);
	}

	.chart {
		display: block;
		width: 100%;
	}

	.line-chart {
		display: block;
	}

	.line {
		stroke: var(--neutral-12);
		stroke-width: 0.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.dot {
		fill: var(--neutral-12);
	}
</style>
