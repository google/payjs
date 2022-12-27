load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_binary", "closure_js_library")
load("//tools/build_defs/js:rules.bzl", "js_library")

# Web Activites, a JavaScript library for launching web activities.
package(
    default_visibility = ["//visibility:public"],
    licenses = ["notice"],
)

exports_files(["LICENSE"])

closure_js_library(
    name = "port",
    srcs = [
        "activity-ports.js",
    ],
    check_level = "LOOSE",
    suppress = [
        "JSC_MISSING_CONST_PROPERTY",
        "JSC_MUST_BE_PRIVATE",
        "JSC_NULLABLE_RETURN_WITH_NAME",
        "JSC_STRICT_INEXISTENT_PROPERTY",
        "JSC_UNKNOWN_EXPR_TYPE",
    ],
    deps = [
        "//third_party/javascript/closure/dom:safe",
        "//third_party/javascript/closure/html:trustedresourceurl",
        "//third_party/javascript/closure/string:const",
        "//third_party/javascript/closure/timer",
        "//third_party/javascript/closure/uri:utils",
    ],
)

closure_js_library(
    name = "host",
    srcs = [
        "activities.js",
    ],
    check_level = "LOOSE",
    suppress = [
        "JSC_MISSING_CONST_PROPERTY",
        "JSC_MUST_BE_PRIVATE",
        "JSC_NULLABLE_RETURN_WITH_NAME",
        "JSC_STRICT_INEXISTENT_PROPERTY",
        "JSC_UNKNOWN_EXPR_TYPE",
    ],
    deps = [
        "//third_party/javascript/closure/uri:utils",
        "//third_party/javascript/safevalues",
        "//third_party/javascript/safevalues/dom",
    ],
)
