'use strict'

const argv = require('yargs').options("playbook", {
  alias: 'p',
  default: 'dev-site.yml',
  describe: 'Antora Playbook file to use to build the site'
}).options("src", {
  alias: 's',
  default: '/usr/src/app',
  describe: 'The documentation source root'
}).options("out", {
  alias: 'o',
  default: 'gh-pages',
  describe: 'The site generation path relative to source root'
}).argv;

const { series } = require("gulp");
const { watch } = require("gulp-watch");
const { remove } = require("fs-extra");
const { resolve } = require('path').resolve;
const { readFileSync, readFile, writeFileSync } = require("fs");
const yamlJs = require("js-yaml");
const generateSite = require('@antora/site-generator-default')
const connect = require("gulp-connect");

const siteSrcDir = argv.src;
const siteOutDir = `${argv.src}/${argv.out}`;
const playbookFile = `${siteSrcDir}/${argv.p}`

//Watch Paths
function watchGlobs() {
  let json_content = readFileSync(playbookFile, "UTF-8");
  let yaml_content = yamlJs.load(json_content);
  let dirs = yaml_content.content.sources.map(source => {
    [
      resolve(`${source.url}/**/**.yml`),
      resolve(`${source.url}/**/**.hbs`),
      resolve(`${source.url}/**/**.adoc`)
    ]
    return []
  });
  dirs.push([playbookFile]);
  dirs = [].concat(...dirs);
  console.log(dirs);
  return dirs;
}

// const siteWatch = () => watch(watchGlobs(), series(build, serve));

const removeSite = done => remove(`${siteOutDir}`, done);
const removeCache = done => remove(`${siteSrcDir}/.cache`, done);

function build(done) {
  console.log(`Using ${playbookFile} to build the site`)
  const args = ["--playbook", playbookFile, "redirect_facility", "static"]
  generateSite(args, process.env)
    .then((ps) => {
      workshopSite(ps)
      done();
    })
    .catch(err => {
      console.log(err);
      done();
    });
}

function workshopSite(ps) {
  //console.log(JSON.stringify(ps));
  const indexFile = `${ps[0].resolvedPath}/index.html`;
  //console.log("Index file:", indexFile);
  readFile(indexFile, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    }
    let fileC = data;
    fileC = fileC.replace(/^(<script>location=)(.*)(<\/script>)/gm, "\$1\$2 + window.location.search \$3");
    writeFileSync(indexFile, fileC);
  });
}

function serve(done) {
  connect.server({ host: "0.0.0.0" }, () => {
    this.server.on(done());
    watch()
  })
}

exports.build = build;
exports.clean = series(removeSite, removeCache);
exports.default = series(removeSite, removeCache, build, serve, siteWatch);
exports.site = series(removeSite, removeCache, build);