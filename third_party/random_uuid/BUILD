# Description:
#   JavaScript library for Random UUID generator.

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_binary", "closure_js_library")
load("//tools/build_defs/js:rules.bzl", "js_library")

package(
    default_visibility = ["//visibility:public"],
    licenses = ["notice"],
)

exports_files(["LICENSE"])

exports_files(["Random.uuid.js"])

closure_js_library(
    name = "uuid",
    srcs = ["Random.uuid.js"],
    suppress = [
        "JSC_MISSING_JSDOC",
        "JSC_UNKNOWN_EXPR_TYPE",
    ],
)
