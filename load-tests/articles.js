import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const responseTrend = new Trend("articles_response_time");
const errorRate = new Rate("articles_error_rate");

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m",  target: 50 },
    { duration: "15s", target: 0  },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    articles_error_rate: ["rate<0.05"],
  },
};

export default function () {
  const res = http.get("http://localhost:3001/api/articles?limit=10&offset=0");

  responseTrend.add(res.timings.duration);
  const success = check(res, {
    "status is 200":         (r) => r.status === 200,
    "has articles field":    (r) => JSON.parse(r.body).articles !== undefined,
    "response time < 1000ms": (r) => r.timings.duration < 1000,
  });
  errorRate.add(!success);

  sleep(1);
}
