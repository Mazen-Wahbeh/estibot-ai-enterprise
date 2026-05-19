const baseUrl = process.env.SECURITY_TEST_BASE_URL || "http://localhost:3021";

async function expectStatus(name, path, init, expected) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (response.status !== expected) {
    const body = await response.text();
    throw new Error(`${name} expected ${expected}, got ${response.status}: ${body.slice(0, 240)}`);
  }
  console.log(`ok - ${name}`);
}

async function main() {
  await expectStatus("public privacy page", "/privacy", undefined, 200);
  await expectStatus("admin metrics require auth", "/api/admin/metrics", undefined, 401);
  await expectStatus("health endpoint requires auth", "/api/health", undefined, 401);
  await expectStatus(
    "cross-origin login blocked",
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://attacker.example"
      },
      body: JSON.stringify({ email: "attacker@example.com", password: "BadPassword1!" })
    },
    403
  );
  await expectStatus(
    "non-json POST blocked",
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Origin: baseUrl
      },
      body: "email=a"
    },
    415
  );
  await expectStatus(
    "oversized POST blocked",
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl
      },
      body: JSON.stringify({ email: "a@example.com", password: "A1!".repeat(90000) })
    },
    413
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
