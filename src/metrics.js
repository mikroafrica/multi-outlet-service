import client from "prom-client";
import responseTime from "response-time";
import path from "path";
import server from "./server";

const register = new client.Registry();
register.setDefaultLabels({
  app: "mikro-utility-service",
});

// A Prometheus counter that counts the invocations with different paths and method
const counter = new client.Counter({
  name: "node_request_operations_total",
  help: "The total number of processed requests",
  labelNames: ["method", "path", "code"],
});
// create histogram metrics to get the duration of requests into one of the buckets
const histogram = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// create guage metrics for numerical values that go up or down e.g memory usage
const guage = new client.Gauge({
  name: "nodejs_http_total_duration",
  help: "the last duration or response time of last request",
  labelNames: ["method", "route"],
});

// A Prometheus summary to record the HTTP method, path, response code and response time
const summary = new client.Summary({
  name: "summary_request_duration_seconds",
  help: "Summary of duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
});

// register the metrics
register.registerMetric(histogram);
register.registerMetric(counter);
register.registerMetric(guage);
register.registerMetric(summary);
client.collectDefaultMetrics({ register });

// increments the counter for requests
export const requestCounters = (req, res, next) => {
  if (req.path !== "/metrics") {
    counter.inc({ method: req.method });
  }
  next();
};

// increments the counters on response and updates the response summary
export const responseCounters = responseTime((req, res, time) => {
  if (req.url !== "/metrics") {
    summary.labels(req.method, req.url, res.statusCode).observe(time);
  }
});

export const hisResCounters = responseTime((req, res, time) => {
  if (req.url !== "/metrics") {
    histogram.labels(req.method, req.url, res.statusCode).observe(time);
  }
});

// create metrics endpoint on auth-service
export const metricsEndpoint = (server) => {
  const end = histogram.startTimer();
  // Return all metrics the Prometheus exposition format
  server.get("/metrics", async (req, res) => {
    const metrics = await register.metrics();
    res.setHeader("Content-Type", register.contentType);
    res.end(metrics);
  });
};
