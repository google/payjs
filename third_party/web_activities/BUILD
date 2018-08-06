load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_library", "closure_js_binary")

# Web Activites, a JavaScript library for launching web activities.
package(
    default_visibility = ["//visibility:public"],
    licenses = ["notice"],  # Apache 2.0
)

exports_files(["LICENSE"])

closure_js_library(
    name = "port",
    srcs = [
        "activity-ports.js",
    ],
    suppress = [
        "JSC_MISSING_CONST_PROPERTY",
        "JSC_MUST_BE_PRIVATE",
        "JSC_NULLABLE_RETURN_WITH_NAME",
        "JSC_STRICT_INEXISTENT_PROPERTY",
        "JSC_UNKNOWN_EXPR_TYPE",
    ],
)

closure_js_library(
    name = "host",
    srcs = [
        "activities.js",
    ],
    suppress = [
        "JSC_MISSING_CONST_PROPERTY",
        "JSC_MUST_BE_PRIVATE",
        "JSC_NULLABLE_RETURN_WITH_NAME",
        "JSC_STRICT_INEXISTENT_PROPERTY",
        "JSC_UNKNOWN_EXPR_TYPE",
    ],
)
