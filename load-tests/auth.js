import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const responseTrend = new Trend("login_response_time");
const errorRate = new Rate("login_error_rate");

export const options = {
  stages: [
    { duration: "15s", target: 30 },
    { duration: "45s", target: 30 },
    { duration: "10s", target: 0  },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    login_error_rate: ["rate<0.05"],
  },
};

const BASE_CREDENTIALS = {
  user: {
    email: "example1@mail.com",
    password: "examplePwd1",
  },
};

export default function () {
  const payload = JSON.stringify(BASE_CREDENTIALS);
  const params = { headers: { "Content-Type": "application/json" } };

  const res = http.post("http://localhost:3001/api/users/login", payload, params);

  responseTrend.add(res.timings.duration);
  const success = check(res, {
    "status is 200":      (r) => r.status === 200,
    "returns a token":    (r) => JSON.parse(r.body)?.user?.token !== undefined,
    "response time < 1000ms": (r) => r.timings.duration < 1000,
  });
  errorRate.add(!success);

  sleep(1);
}
