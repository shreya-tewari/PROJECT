/**
 * Observability & Telemetry Service (LangSmith / OpenTelemetry Standard)
 * Tracks node spans, latency, token consumption, and workflow event logs.
 */

class ObservabilityService {
  constructor() {
    this.telemetryLogs = [];
    this.activeSpans = new Map();
  }

  startSpan(spanName, metadata = {}) {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const span = {
      spanId,
      name: spanName,
      startTime: Date.now(),
      metadata,
      status: "RUNNING",
    };
    this.activeSpans.set(spanId, span);
    return spanId;
  }

  endSpan(spanId, outputData = {}, error = null) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    const endTime = Date.now();
    const durationMs = endTime - span.startTime;

    const completedSpan = {
      ...span,
      endTime,
      durationMs,
      status: error ? "ERROR" : "COMPLETED",
      output: outputData,
      error: error ? error.message : null,
    };

    this.activeSpans.delete(spanId);
    this.telemetryLogs.push(completedSpan);

    if (typeof window !== "undefined" && window.__LANGSMITH_TELEMETRY__) {
      window.__LANGSMITH_TELEMETRY__.push(completedSpan);
    }
  }

  getLogs() {
    return [...this.telemetryLogs];
  }

  clearLogs() {
    this.telemetryLogs = [];
  }
}

export const observability = new ObservabilityService();
