<script lang="ts">
	import type { Log } from '$lib/entities/logs/schema';

	type Props = {
		logs: Log[];
	};

	let { logs }: Props = $props();

	const chartData = $derived.by(() => {
		const chronological = [...(logs ?? [])].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);
		return chronological.map((log) => {
			const oneRM = Math.max(...log.sets.map((s) => s.weight * (1 + s.reps / 30)));
			return { date: log.createdAt, oneRM };
		});
	});

	const meanOneRM = $derived(
		chartData.length > 0 ? chartData.reduce((s, d) => s + d.oneRM, 0) / chartData.length : 0
	);
	const stdOneRM = $derived.by(() => {
		if (chartData.length < 2) return 1;
		const variance =
			chartData.reduce((s, d) => s + (d.oneRM - meanOneRM) ** 2, 0) / (chartData.length - 1);
		return Math.sqrt(variance) || 1;
	});

	// Z-score normalization: 0.5 + z/4, clamped to [0, 1]
	const normalizedData = $derived(
		chartData.map((item) => {
			const z = (item.oneRM - meanOneRM) / stdOneRM;
			const raw = 0.5 + z / 4;
			const normalized = Math.max(0, Math.min(1, raw));
			return { ...item, normalized };
		})
	);

	const cellW = 0.7;
	const gap = 1.2;
	const chartH = 8;
	const minBarH = 0.3;
	const dotR = cellW / 2;
	const step = cellW + gap;
	const svgWidth = $derived(
		normalizedData.length * cellW + Math.max(0, normalizedData.length - 1) * gap
	);

	const padTop = dotR * 2 + 0.2;
	const padBottom = 0.25;
	const padLeft = dotR;
	const padRight = dotR;
	const vbX = $derived(-padLeft);
	const vbY = $derived(-padTop);
	const vbW = $derived(svgWidth + padLeft + padRight);
	const vbH = $derived(chartH + padTop + padBottom);

	const bars = $derived(
		normalizedData.map((item, i) => {
			const barH = Math.max(item.normalized * chartH, minBarH);
			const x = i * step;
			const y = chartH - barH;
			return { x, y, w: cellW, h: barH, ...item };
		})
	);

	const dotCenters = $derived(
		bars.map((b) => ({
			x: b.x + cellW / 2,
			y: b.y - dotR
		}))
	);

	function smoothPath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
		const tension = 1 / 6;
		let d = `M ${points[0].x} ${points[0].y}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[Math.max(0, i - 1)];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[Math.min(points.length - 1, i + 2)];
			const c1x = p1.x + (p2.x - p0.x) * tension;
			const c1y = p1.y + (p2.y - p0.y) * tension;
			const c2x = p2.x - (p3.x - p1.x) * tension;
			const c2y = p2.y - (p3.y - p1.y) * tension;
			d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
		}
		return d;
	}

	const linePath = $derived(smoothPath(dotCenters));

	const trend = $derived.by(() => {
		const pts = dotCenters;
		if (pts.length < 2) return { path: '', stroke: 'var(--neutral-9)' };
		const n = pts.length;
		let sumX = 0;
		let sumY = 0;
		let sumXY = 0;
		let sumX2 = 0;
		for (const p of pts) {
			sumX += p.x;
			sumY += p.y;
			sumXY += p.x * p.y;
			sumX2 += p.x * p.x;
		}
		const denom = n * sumX2 - sumX * sumX;
		const m = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
		const b = (sumY - m * sumX) / n;
		const x0 = pts[0].x;
		const x1 = pts[n - 1].x;
		const y0 = m * x0 + b;
		const y1 = m * x1 + b;
		const path = `M ${x0} ${y0} L ${x1} ${y1}`;
		const stroke = m < 0 ? 'var(--green)' : m > 0 ? 'var(--red)' : 'var(--neutral-9)';
		return { path, stroke };
	});

	const latestOneRM = $derived(
		chartData.length > 0 ? Math.round(chartData[chartData.length - 1].oneRM) : null
	);
</script>

{#if normalizedData.length === 0}
	<p class="empty">No data yet. Log some sets to see the chart.</p>
{:else}
	<div class="chart" role="img" aria-label="Estimated 1RM per session chart">
		{#if latestOneRM !== null}
			<p class="latest">Latest: <strong>{latestOneRM} kg</strong></p>
		{/if}
		<div class="chart-scroll">
			<svg class="chart-svg" viewBox="{vbX} {vbY} {vbW} {vbH}" preserveAspectRatio="xMidYMid meet">
				<path
					d={trend.path}
					fill="none"
					stroke={trend.stroke}
					stroke-width="0.15"
					stroke-dasharray="0.3 0.6"
					stroke-linecap="round"
				/>
				<path
					d={linePath}
					fill="none"
					stroke="var(--neutral-12)"
					stroke-width="0.15"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				{#each bars as bar (bar.date)}
					<circle class="dot" cx={bar.x + cellW / 2} cy={bar.y - dotR} r={dotR}></circle>
				{/each}
			</svg>
		</div>
	</div>
{/if}

<style>
	.empty {
		font-size: 1.4rem;
		color: var(--neutral-11);
		margin-block-start: 0.4rem;
	}

	.latest {
		font-size: 1.3rem;
		color: var(--neutral-11);
		margin-block-end: 0.4rem;

		& strong {
			color: var(--neutral-12);
			font-weight: 600;
		}
	}

	.chart {
		width: 100%;
		display: flex;
		flex-direction: column;
		overflow-x: auto;
		background-color: var(--neutral-4);
		border-radius: 0.8rem;
		padding: 1.2rem;
		margin-block-start: 1rem;
	}

	.chart-scroll {
		flex-shrink: 0;
		height: 10rem;
	}

	.chart-svg {
		display: block;
		height: 100%;
	}

	.dot {
		fill: var(--neutral-12);
	}
</style>
