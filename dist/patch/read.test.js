"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_1 = require("./read");
const PackageDetails_1 = require("../PackageDetails");
const removeAnsiCodes = (s) => s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
jest.mock("fs-extra", () => ({
    readFileSync: jest.fn(),
}));
jest.mock("./parse", () => ({
    parsePatchFile: jest.fn(() => {
        throw new Error("hunk integrity check failed etc");
    }),
}));
const error = jest.fn();
console.error = error;
process.cwd = jest.fn(() => "/test/root");
process.exit = jest.fn();
describe(read_1.readPatch, () => {
    beforeEach(() => {
        error.mockReset();
    });
    it("throws an error for basic packages", () => {
        read_1.readPatch({
            patchFilePath: "/test/root/patches/test+1.2.3.patch",
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename("test+1.2.3.patch"),
            patchDir: "patches/",
        });
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package test
    
  This happened because the patch file patches/test+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    patch -p1 -i patches/test+1.2.3.patch
    npx patch-package test
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
    it("throws an error for scoped packages", () => {
        read_1.readPatch({
            patchFilePath: "/test/root/patches/@david+test+1.2.3.patch",
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename("@david+test+1.2.3.patch"),
            patchDir: "patches/",
        });
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package @david/test
    
  This happened because the patch file patches/@david+test+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    patch -p1 -i patches/@david+test+1.2.3.patch
    npx patch-package @david/test
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
    it("throws an error for nested packages", () => {
        const patchFileName = "@david+test++react-native+1.2.3.patch";
        read_1.readPatch({
            patchFilePath: `/test/root/patches/${patchFileName}`,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename(patchFileName),
            patchDir: "patches/",
        });
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package @david/test => react-native
    
  This happened because the patch file patches/@david+test++react-native+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    patch -p1 -i patches/@david+test++react-native+1.2.3.patch
    npx patch-package @david/test/react-native
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
    it("throws an error for with custom patch dir", () => {
        const patchFileName = "@david+test++react-native+1.2.3.patch";
        read_1.readPatch({
            patchFilePath: `/test/root/.cruft/patches/${patchFileName}`,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename(patchFileName),
            patchDir: ".cruft/patches",
        });
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package @david/test => react-native
    
  This happened because the patch file .cruft/patches/@david+test++react-native+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    patch -p1 -i .cruft/patches/@david+test++react-native+1.2.3.patch
    npx patch-package @david/test/react-native
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
    it("throws an error with cd instruction for unhoisted packages", () => {
        const patchFileName = "@david+test++react-native+1.2.3.patch";
        read_1.readPatch({
            patchFilePath: `/test/root/packages/banana/patches/${patchFileName}`,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename(patchFileName),
            patchDir: "patches/",
        });
        expect(process.cwd).toHaveBeenCalled();
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package @david/test => react-native
    
  This happened because the patch file packages/banana/patches/@david+test++react-native+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    cd packages/banana/
    patch -p1 -i patches/@david+test++react-native+1.2.3.patch
    npx patch-package @david/test/react-native
    cd ../..
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
    it("throws an error with cd instruction for unhoisted packages and custom patchDir", () => {
        const patchFileName = "@david+test++react-native+1.2.3.patch";
        read_1.readPatch({
            patchFilePath: `/test/root/packages/banana/.patches/${patchFileName}`,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename(patchFileName),
            patchDir: ".patches/",
        });
        expect(process.cwd).toHaveBeenCalled();
        expect(removeAnsiCodes(error.mock.calls[0][0])).toMatchInlineSnapshot(`
"
**ERROR** Failed to apply patch for package @david/test => react-native
    
  This happened because the patch file packages/banana/.patches/@david+test++react-native+1.2.3.patch could not be parsed.
   
  If you just upgraded patch-package, you can try running:
  
    cd packages/banana/
    patch -p1 -i .patches/@david+test++react-native+1.2.3.patch
    npx patch-package @david/test/react-native
    cd ../..
    
  Otherwise, try manually creating the patch file again.
  
  If the problem persists, please submit a bug report:
  
    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E

"
`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BhdGNoL3JlYWQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFrQztBQUNsQyxzREFBc0U7QUFFdEUsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUNwQyxDQUFDLENBQUMsT0FBTyxDQUNQLDZFQUE2RSxFQUM3RSxFQUFFLENBQ0gsQ0FBQTtBQUVILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDM0IsWUFBWSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7Q0FDeEIsQ0FBQyxDQUFDLENBQUE7QUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtRQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDO0NBQ0gsQ0FBQyxDQUFDLENBQUE7QUFFSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUE7QUFDdkIsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDckIsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3pDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBUyxDQUFBO0FBRS9CLFFBQVEsQ0FBQyxnQkFBUyxFQUFFLEdBQUcsRUFBRTtJQUN2QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQ25CLENBQUMsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtRQUM1QyxnQkFB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LGFBQWEsRUFBRSx1Q0FBdUMsYUFBYSxFQUFFO1lBQ3JFLGNBQWMsRUFBRSxtREFBa0MsQ0FBQyxhQUFhLENBQUU7WUFDbEUsUUFBUSxFQUFFLFdBQVc7U0FDdEIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1FBRXRDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CekUsQ0FBQyxDQUFBO0lBQ0EsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRQYXRjaCB9IGZyb20gXCIuL3JlYWRcIlxuaW1wb3J0IHsgZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZSB9IGZyb20gXCIuLi9QYWNrYWdlRGV0YWlsc1wiXG5cbmNvbnN0IHJlbW92ZUFuc2lDb2RlcyA9IChzOiBzdHJpbmcpID0+XG4gIHMucmVwbGFjZShcbiAgICAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1PUlpjZi1ucXJ5PT48XS9nLFxuICAgIFwiXCIsXG4gIClcblxuamVzdC5tb2NrKFwiZnMtZXh0cmFcIiwgKCkgPT4gKHtcbiAgcmVhZEZpbGVTeW5jOiBqZXN0LmZuKCksXG59KSlcbmplc3QubW9jayhcIi4vcGFyc2VcIiwgKCkgPT4gKHtcbiAgcGFyc2VQYXRjaEZpbGU6IGplc3QuZm4oKCkgPT4ge1xuICAgIHRocm93IG5ldyBFcnJvcihcImh1bmsgaW50ZWdyaXR5IGNoZWNrIGZhaWxlZCBldGNcIilcbiAgfSksXG59KSlcblxuY29uc3QgZXJyb3IgPSBqZXN0LmZuKClcbmNvbnNvbGUuZXJyb3IgPSBlcnJvclxucHJvY2Vzcy5jd2QgPSBqZXN0LmZuKCgpID0+IFwiL3Rlc3Qvcm9vdFwiKVxucHJvY2Vzcy5leGl0ID0gamVzdC5mbigpIGFzIGFueVxuXG5kZXNjcmliZShyZWFkUGF0Y2gsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgZXJyb3IubW9ja1Jlc2V0KClcbiAgfSlcbiAgaXQoXCJ0aHJvd3MgYW4gZXJyb3IgZm9yIGJhc2ljIHBhY2thZ2VzXCIsICgpID0+IHtcbiAgICByZWFkUGF0Y2goe1xuICAgICAgcGF0Y2hGaWxlUGF0aDogXCIvdGVzdC9yb290L3BhdGNoZXMvdGVzdCsxLjIuMy5wYXRjaFwiLFxuICAgICAgcGFja2FnZURldGFpbHM6IGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUoXCJ0ZXN0KzEuMi4zLnBhdGNoXCIpISxcbiAgICAgIHBhdGNoRGlyOiBcInBhdGNoZXMvXCIsXG4gICAgfSlcblxuICAgIGV4cGVjdChyZW1vdmVBbnNpQ29kZXMoZXJyb3IubW9jay5jYWxsc1swXVswXSkpLnRvTWF0Y2hJbmxpbmVTbmFwc2hvdChgXG5cIlxuKipFUlJPUioqIEZhaWxlZCB0byBhcHBseSBwYXRjaCBmb3IgcGFja2FnZSB0ZXN0XG4gICAgXG4gIFRoaXMgaGFwcGVuZWQgYmVjYXVzZSB0aGUgcGF0Y2ggZmlsZSBwYXRjaGVzL3Rlc3QrMS4yLjMucGF0Y2ggY291bGQgbm90IGJlIHBhcnNlZC5cbiAgIFxuICBJZiB5b3UganVzdCB1cGdyYWRlZCBwYXRjaC1wYWNrYWdlLCB5b3UgY2FuIHRyeSBydW5uaW5nOlxuICBcbiAgICBwYXRjaCAtcDEgLWkgcGF0Y2hlcy90ZXN0KzEuMi4zLnBhdGNoXG4gICAgbnB4IHBhdGNoLXBhY2thZ2UgdGVzdFxuICAgIFxuICBPdGhlcndpc2UsIHRyeSBtYW51YWxseSBjcmVhdGluZyB0aGUgcGF0Y2ggZmlsZSBhZ2Fpbi5cbiAgXG4gIElmIHRoZSBwcm9ibGVtIHBlcnNpc3RzLCBwbGVhc2Ugc3VibWl0IGEgYnVnIHJlcG9ydDpcbiAgXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL2RzMzAwL3BhdGNoLXBhY2thZ2UvaXNzdWVzL25ldz90aXRsZT1QYXRjaCtmaWxlK3BhcnNlK2Vycm9yJmJvZHk9JTNDUGxlYXNlK2F0dGFjaCt0aGUrcGF0Y2grZmlsZStpbitxdWVzdGlvbiUzRVxuXG5cIlxuYClcbiAgfSlcblxuICBpdChcInRocm93cyBhbiBlcnJvciBmb3Igc2NvcGVkIHBhY2thZ2VzXCIsICgpID0+IHtcbiAgICByZWFkUGF0Y2goe1xuICAgICAgcGF0Y2hGaWxlUGF0aDogXCIvdGVzdC9yb290L3BhdGNoZXMvQGRhdmlkK3Rlc3QrMS4yLjMucGF0Y2hcIixcbiAgICAgIHBhY2thZ2VEZXRhaWxzOiBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKFxuICAgICAgICBcIkBkYXZpZCt0ZXN0KzEuMi4zLnBhdGNoXCIsXG4gICAgICApISxcbiAgICAgIHBhdGNoRGlyOiBcInBhdGNoZXMvXCIsXG4gICAgfSlcblxuICAgIGV4cGVjdChyZW1vdmVBbnNpQ29kZXMoZXJyb3IubW9jay5jYWxsc1swXVswXSkpLnRvTWF0Y2hJbmxpbmVTbmFwc2hvdChgXG5cIlxuKipFUlJPUioqIEZhaWxlZCB0byBhcHBseSBwYXRjaCBmb3IgcGFja2FnZSBAZGF2aWQvdGVzdFxuICAgIFxuICBUaGlzIGhhcHBlbmVkIGJlY2F1c2UgdGhlIHBhdGNoIGZpbGUgcGF0Y2hlcy9AZGF2aWQrdGVzdCsxLjIuMy5wYXRjaCBjb3VsZCBub3QgYmUgcGFyc2VkLlxuICAgXG4gIElmIHlvdSBqdXN0IHVwZ3JhZGVkIHBhdGNoLXBhY2thZ2UsIHlvdSBjYW4gdHJ5IHJ1bm5pbmc6XG4gIFxuICAgIHBhdGNoIC1wMSAtaSBwYXRjaGVzL0BkYXZpZCt0ZXN0KzEuMi4zLnBhdGNoXG4gICAgbnB4IHBhdGNoLXBhY2thZ2UgQGRhdmlkL3Rlc3RcbiAgICBcbiAgT3RoZXJ3aXNlLCB0cnkgbWFudWFsbHkgY3JlYXRpbmcgdGhlIHBhdGNoIGZpbGUgYWdhaW4uXG4gIFxuICBJZiB0aGUgcHJvYmxlbSBwZXJzaXN0cywgcGxlYXNlIHN1Ym1pdCBhIGJ1ZyByZXBvcnQ6XG4gIFxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9kczMwMC9wYXRjaC1wYWNrYWdlL2lzc3Vlcy9uZXc/dGl0bGU9UGF0Y2grZmlsZStwYXJzZStlcnJvciZib2R5PSUzQ1BsZWFzZSthdHRhY2grdGhlK3BhdGNoK2ZpbGUraW4rcXVlc3Rpb24lM0VcblxuXCJcbmApXG4gIH0pXG5cbiAgaXQoXCJ0aHJvd3MgYW4gZXJyb3IgZm9yIG5lc3RlZCBwYWNrYWdlc1wiLCAoKSA9PiB7XG4gICAgY29uc3QgcGF0Y2hGaWxlTmFtZSA9IFwiQGRhdmlkK3Rlc3QrK3JlYWN0LW5hdGl2ZSsxLjIuMy5wYXRjaFwiXG4gICAgcmVhZFBhdGNoKHtcbiAgICAgIHBhdGNoRmlsZVBhdGg6IGAvdGVzdC9yb290L3BhdGNoZXMvJHtwYXRjaEZpbGVOYW1lfWAsXG4gICAgICBwYWNrYWdlRGV0YWlsczogZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZShwYXRjaEZpbGVOYW1lKSEsXG4gICAgICBwYXRjaERpcjogXCJwYXRjaGVzL1wiLFxuICAgIH0pXG5cbiAgICBleHBlY3QocmVtb3ZlQW5zaUNvZGVzKGVycm9yLm1vY2suY2FsbHNbMF1bMF0pKS50b01hdGNoSW5saW5lU25hcHNob3QoYFxuXCJcbioqRVJST1IqKiBGYWlsZWQgdG8gYXBwbHkgcGF0Y2ggZm9yIHBhY2thZ2UgQGRhdmlkL3Rlc3QgPT4gcmVhY3QtbmF0aXZlXG4gICAgXG4gIFRoaXMgaGFwcGVuZWQgYmVjYXVzZSB0aGUgcGF0Y2ggZmlsZSBwYXRjaGVzL0BkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2ggY291bGQgbm90IGJlIHBhcnNlZC5cbiAgIFxuICBJZiB5b3UganVzdCB1cGdyYWRlZCBwYXRjaC1wYWNrYWdlLCB5b3UgY2FuIHRyeSBydW5uaW5nOlxuICBcbiAgICBwYXRjaCAtcDEgLWkgcGF0Y2hlcy9AZGF2aWQrdGVzdCsrcmVhY3QtbmF0aXZlKzEuMi4zLnBhdGNoXG4gICAgbnB4IHBhdGNoLXBhY2thZ2UgQGRhdmlkL3Rlc3QvcmVhY3QtbmF0aXZlXG4gICAgXG4gIE90aGVyd2lzZSwgdHJ5IG1hbnVhbGx5IGNyZWF0aW5nIHRoZSBwYXRjaCBmaWxlIGFnYWluLlxuICBcbiAgSWYgdGhlIHByb2JsZW0gcGVyc2lzdHMsIHBsZWFzZSBzdWJtaXQgYSBidWcgcmVwb3J0OlxuICBcbiAgICBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXMvbmV3P3RpdGxlPVBhdGNoK2ZpbGUrcGFyc2UrZXJyb3ImYm9keT0lM0NQbGVhc2UrYXR0YWNoK3RoZStwYXRjaCtmaWxlK2luK3F1ZXN0aW9uJTNFXG5cblwiXG5gKVxuICB9KVxuXG4gIGl0KFwidGhyb3dzIGFuIGVycm9yIGZvciB3aXRoIGN1c3RvbSBwYXRjaCBkaXJcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHBhdGNoRmlsZU5hbWUgPSBcIkBkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2hcIlxuICAgIHJlYWRQYXRjaCh7XG4gICAgICBwYXRjaEZpbGVQYXRoOiBgL3Rlc3Qvcm9vdC8uY3J1ZnQvcGF0Y2hlcy8ke3BhdGNoRmlsZU5hbWV9YCxcbiAgICAgIHBhY2thZ2VEZXRhaWxzOiBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKHBhdGNoRmlsZU5hbWUpISxcbiAgICAgIHBhdGNoRGlyOiBcIi5jcnVmdC9wYXRjaGVzXCIsXG4gICAgfSlcblxuICAgIGV4cGVjdChyZW1vdmVBbnNpQ29kZXMoZXJyb3IubW9jay5jYWxsc1swXVswXSkpLnRvTWF0Y2hJbmxpbmVTbmFwc2hvdChgXG5cIlxuKipFUlJPUioqIEZhaWxlZCB0byBhcHBseSBwYXRjaCBmb3IgcGFja2FnZSBAZGF2aWQvdGVzdCA9PiByZWFjdC1uYXRpdmVcbiAgICBcbiAgVGhpcyBoYXBwZW5lZCBiZWNhdXNlIHRoZSBwYXRjaCBmaWxlIC5jcnVmdC9wYXRjaGVzL0BkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2ggY291bGQgbm90IGJlIHBhcnNlZC5cbiAgIFxuICBJZiB5b3UganVzdCB1cGdyYWRlZCBwYXRjaC1wYWNrYWdlLCB5b3UgY2FuIHRyeSBydW5uaW5nOlxuICBcbiAgICBwYXRjaCAtcDEgLWkgLmNydWZ0L3BhdGNoZXMvQGRhdmlkK3Rlc3QrK3JlYWN0LW5hdGl2ZSsxLjIuMy5wYXRjaFxuICAgIG5weCBwYXRjaC1wYWNrYWdlIEBkYXZpZC90ZXN0L3JlYWN0LW5hdGl2ZVxuICAgIFxuICBPdGhlcndpc2UsIHRyeSBtYW51YWxseSBjcmVhdGluZyB0aGUgcGF0Y2ggZmlsZSBhZ2Fpbi5cbiAgXG4gIElmIHRoZSBwcm9ibGVtIHBlcnNpc3RzLCBwbGVhc2Ugc3VibWl0IGEgYnVnIHJlcG9ydDpcbiAgXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL2RzMzAwL3BhdGNoLXBhY2thZ2UvaXNzdWVzL25ldz90aXRsZT1QYXRjaCtmaWxlK3BhcnNlK2Vycm9yJmJvZHk9JTNDUGxlYXNlK2F0dGFjaCt0aGUrcGF0Y2grZmlsZStpbitxdWVzdGlvbiUzRVxuXG5cIlxuYClcbiAgfSlcblxuICBpdChcInRocm93cyBhbiBlcnJvciB3aXRoIGNkIGluc3RydWN0aW9uIGZvciB1bmhvaXN0ZWQgcGFja2FnZXNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHBhdGNoRmlsZU5hbWUgPSBcIkBkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2hcIlxuICAgIHJlYWRQYXRjaCh7XG4gICAgICBwYXRjaEZpbGVQYXRoOiBgL3Rlc3Qvcm9vdC9wYWNrYWdlcy9iYW5hbmEvcGF0Y2hlcy8ke3BhdGNoRmlsZU5hbWV9YCxcbiAgICAgIHBhY2thZ2VEZXRhaWxzOiBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKHBhdGNoRmlsZU5hbWUpISxcbiAgICAgIHBhdGNoRGlyOiBcInBhdGNoZXMvXCIsXG4gICAgfSlcblxuICAgIGV4cGVjdChwcm9jZXNzLmN3ZCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBleHBlY3QocmVtb3ZlQW5zaUNvZGVzKGVycm9yLm1vY2suY2FsbHNbMF1bMF0pKS50b01hdGNoSW5saW5lU25hcHNob3QoYFxuXCJcbioqRVJST1IqKiBGYWlsZWQgdG8gYXBwbHkgcGF0Y2ggZm9yIHBhY2thZ2UgQGRhdmlkL3Rlc3QgPT4gcmVhY3QtbmF0aXZlXG4gICAgXG4gIFRoaXMgaGFwcGVuZWQgYmVjYXVzZSB0aGUgcGF0Y2ggZmlsZSBwYWNrYWdlcy9iYW5hbmEvcGF0Y2hlcy9AZGF2aWQrdGVzdCsrcmVhY3QtbmF0aXZlKzEuMi4zLnBhdGNoIGNvdWxkIG5vdCBiZSBwYXJzZWQuXG4gICBcbiAgSWYgeW91IGp1c3QgdXBncmFkZWQgcGF0Y2gtcGFja2FnZSwgeW91IGNhbiB0cnkgcnVubmluZzpcbiAgXG4gICAgY2QgcGFja2FnZXMvYmFuYW5hL1xuICAgIHBhdGNoIC1wMSAtaSBwYXRjaGVzL0BkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2hcbiAgICBucHggcGF0Y2gtcGFja2FnZSBAZGF2aWQvdGVzdC9yZWFjdC1uYXRpdmVcbiAgICBjZCAuLi8uLlxuICAgIFxuICBPdGhlcndpc2UsIHRyeSBtYW51YWxseSBjcmVhdGluZyB0aGUgcGF0Y2ggZmlsZSBhZ2Fpbi5cbiAgXG4gIElmIHRoZSBwcm9ibGVtIHBlcnNpc3RzLCBwbGVhc2Ugc3VibWl0IGEgYnVnIHJlcG9ydDpcbiAgXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL2RzMzAwL3BhdGNoLXBhY2thZ2UvaXNzdWVzL25ldz90aXRsZT1QYXRjaCtmaWxlK3BhcnNlK2Vycm9yJmJvZHk9JTNDUGxlYXNlK2F0dGFjaCt0aGUrcGF0Y2grZmlsZStpbitxdWVzdGlvbiUzRVxuXG5cIlxuYClcbiAgfSlcblxuICBpdChcInRocm93cyBhbiBlcnJvciB3aXRoIGNkIGluc3RydWN0aW9uIGZvciB1bmhvaXN0ZWQgcGFja2FnZXMgYW5kIGN1c3RvbSBwYXRjaERpclwiLCAoKSA9PiB7XG4gICAgY29uc3QgcGF0Y2hGaWxlTmFtZSA9IFwiQGRhdmlkK3Rlc3QrK3JlYWN0LW5hdGl2ZSsxLjIuMy5wYXRjaFwiXG4gICAgcmVhZFBhdGNoKHtcbiAgICAgIHBhdGNoRmlsZVBhdGg6IGAvdGVzdC9yb290L3BhY2thZ2VzL2JhbmFuYS8ucGF0Y2hlcy8ke3BhdGNoRmlsZU5hbWV9YCxcbiAgICAgIHBhY2thZ2VEZXRhaWxzOiBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKHBhdGNoRmlsZU5hbWUpISxcbiAgICAgIHBhdGNoRGlyOiBcIi5wYXRjaGVzL1wiLFxuICAgIH0pXG5cbiAgICBleHBlY3QocHJvY2Vzcy5jd2QpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZXhwZWN0KHJlbW92ZUFuc2lDb2RlcyhlcnJvci5tb2NrLmNhbGxzWzBdWzBdKSkudG9NYXRjaElubGluZVNuYXBzaG90KGBcblwiXG4qKkVSUk9SKiogRmFpbGVkIHRvIGFwcGx5IHBhdGNoIGZvciBwYWNrYWdlIEBkYXZpZC90ZXN0ID0+IHJlYWN0LW5hdGl2ZVxuICAgIFxuICBUaGlzIGhhcHBlbmVkIGJlY2F1c2UgdGhlIHBhdGNoIGZpbGUgcGFja2FnZXMvYmFuYW5hLy5wYXRjaGVzL0BkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2ggY291bGQgbm90IGJlIHBhcnNlZC5cbiAgIFxuICBJZiB5b3UganVzdCB1cGdyYWRlZCBwYXRjaC1wYWNrYWdlLCB5b3UgY2FuIHRyeSBydW5uaW5nOlxuICBcbiAgICBjZCBwYWNrYWdlcy9iYW5hbmEvXG4gICAgcGF0Y2ggLXAxIC1pIC5wYXRjaGVzL0BkYXZpZCt0ZXN0KytyZWFjdC1uYXRpdmUrMS4yLjMucGF0Y2hcbiAgICBucHggcGF0Y2gtcGFja2FnZSBAZGF2aWQvdGVzdC9yZWFjdC1uYXRpdmVcbiAgICBjZCAuLi8uLlxuICAgIFxuICBPdGhlcndpc2UsIHRyeSBtYW51YWxseSBjcmVhdGluZyB0aGUgcGF0Y2ggZmlsZSBhZ2Fpbi5cbiAgXG4gIElmIHRoZSBwcm9ibGVtIHBlcnNpc3RzLCBwbGVhc2Ugc3VibWl0IGEgYnVnIHJlcG9ydDpcbiAgXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL2RzMzAwL3BhdGNoLXBhY2thZ2UvaXNzdWVzL25ldz90aXRsZT1QYXRjaCtmaWxlK3BhcnNlK2Vycm9yJmJvZHk9JTNDUGxlYXNlK2F0dGFjaCt0aGUrcGF0Y2grZmlsZStpbitxdWVzdGlvbiUzRVxuXG5cIlxuYClcbiAgfSlcbn0pXG4iXX0=