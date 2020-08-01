import { remove } from "fs-extra"
import * as gulp from 'gulp'
import * as generator from "@antora/site-generator-default"

interface BuildConfig {
  srcDir: string;
  outputDir: string;
  playbook: string;
  cacheDir: string;
  [x: string]: unknown;
  $0: string;
  _: string[];
}

export class BuildTasks {
  protected buildConfig: BuildConfig;
  cleanBuild: string[] = ["cleanCache", "cleanSite", "build"];

  siteOutDir: string;
  playbookFile: string;

  constructor(buildConfig: BuildConfig) {
    this.buildConfig = buildConfig;
    this.siteOutDir = `${buildConfig.srcDir}/${buildConfig.outputDir}`;
    this.playbookFile = `${buildConfig.srcDir}/${buildConfig.playbook}`;
  }

  cleanCache(cb) {
    remove(this.buildConfig.cacheDir)
      .then(() => cb())
      .catch(err => console.log("Error cleaning cache directory", err));
  }

  cleanSite(cb) {
    remove(this.buildConfig.cacheDir)
      .then(() => cb())
      .catch(err => console.log("Error cleaning site directory ", err));
  }

  build(cb) {
    console.log(`Building site ${this.playbookFile}`);
    const args: string[] = ["--playbook", this.playbookFile, "--redirect_facility", "static"]
    generator(args, null);
    cb();
  }

  defaultTask(cb) {
    console.log("Default");
    cb();
  }

  public configure() {
    gulp.task("cleanCache", this.cleanCache.bind(this));
    gulp.task("cleanSite", this.cleanSite.bind(this));
    gulp.task("build", this.build.bind(this));
    gulp.task("default", this.defaultTask.bind(this));
    gulp.task("cleanBuild", gulp.series(this.cleanBuild));
  }

}
