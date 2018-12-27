import { toArray } from "rxjs/operators";

import { launchKernel } from "../src/kernel";
import { DebugLogger } from "builder-util";

jest.unmock("process");

describe("Kernel", () => {
  it.skip("can launch a kernel given a name", async done => {
    const kernel = await launchKernel("python3");
    expect(kernel.process).toBeDefined();
    await kernel.shutdown();
    done();
  });
  it.skip("can shutdown a kernel", async done => {
    const kernel = await launchKernel("python3");
    const originalKill = process.kill;
    process.kill = jest.fn();
    expect(kernel.process).toBeDefined();
    await kernel.shutdown();
    expect(process.kill).toBeCalledWith(kernel.process.pid);
    expect(process.kill).toBeCalledTimes(1);
    process.kill = originalKill;
    await kernel.shutdown();
    done();
  });
  it("creates a valid shutdown epic", async done => {
    const originalKill = process.kill;
    process.kill = jest.fn(pid => {});
    const kernel = await launchKernel("python3");
    const shutdown$ = await kernel
      .shutdownEpic()
      .pipe(toArray())
      .toPromise();
    expect(shutdown$[0].subscribe).toBeTruthy();
    expect(shutdown$[0].value).toEqual({
      status: "shutdown",
      id: kernel.id
    });
    process.kill = originalKill;
    kernel.process.kill();
    done();
  });
  it("can get usage metrics on a kernel", async done => {
    const kernel = await launchKernel("python3");
    const stats = await kernel.getUsage();
    expect(stats.memory).toBeDefined();
    expect(stats.pid).toEqual(kernel.process.pid);
    await kernel.shutdown();
    done();
  });
});
