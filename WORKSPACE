http_archive(
    name = "io_bazel_rules_closure",
    sha256 = "a80acb69c63d5f6437b099c111480a4493bad4592015af2127a2f49fb7512d8d",
    strip_prefix = "rules_closure-0.7.0",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_closure/archive/0.7.0.tar.gz",
        "https://github.com/bazelbuild/rules_closure/archive/0.7.0.tar.gz",
    ],
)

# TODO: Importing dagger library is required because old dagger library imported by closure is
# not compatible with Java 9. Remove when closure imports new version of dagger

load("@io_bazel_rules_closure//closure/private:java_import_external.bzl", "java_import_external")

java_import_external(
    name = "com_google_dagger",
    jar_sha256 = "374cfee26c9c93f44caa1946583c9edc135bb9a42838476522551ec46aa55c7c",
    jar_urls = [
        "https://mirror.bazel.build/repo1.maven.org/maven2/com/google/dagger/dagger/2.14.1/dagger-2.14.1.jar",
        "https://repo1.maven.org/maven2/com/google/dagger/dagger/2.14.1/dagger-2.14.1.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    deps = ["@javax_inject"],
    generated_rule_name = "runtime",
    extra_build_file_content = "\n".join([
        "java_library(",
        "    name = \"com_google_dagger\",",
        "    exported_plugins = [\"@com_google_dagger_compiler//:ComponentProcessor\"],",
        "    exports = [",
        "        \":runtime\",",
        "        \"@javax_inject\",",
        "    ],",
        ")",
    ]),
)

java_import_external(
    name = "com_google_dagger_compiler",
    jar_sha256 = "ff16d55273e375349537fc82292b00de04d8a2caca2d4aa6c642692b1a68194d",
    jar_urls = [
        "https://mirror.bazel.build/repo1.maven.org/maven2/com/google/dagger/dagger-compiler/2.14.1/dagger-compiler-2.14.1.jar",
        "https://repo1.maven.org/maven2/com/google/dagger/dagger-compiler/2.14.1/dagger-compiler-2.14.1.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    deps = [
        "@com_google_code_findbugs_jsr305",
        "@com_google_dagger//:runtime",
        "@com_google_dagger_producers//:runtime",
        "@com_google_dagger_spi",
        "@com_google_guava",
        "@com_google_java_format",
        "@com_squareup_javapoet",
    ],
    extra_build_file_content = "\n".join([
        "java_plugin(",
        "    name = \"ComponentProcessor\",",
        "    output_licenses = [\"unencumbered\"],",
        "    processor_class = \"dagger.internal.codegen.ComponentProcessor\",",
        "    generates_api = 1,",
        "    tags = [",
        "        \"annotation=dagger.Component;genclass=${package}.Dagger${outerclasses}${classname}\",",
        "        \"annotation=dagger.producers.ProductionComponent;genclass=${package}.Dagger${outerclasses}${classname}\",",
        "    ],",
        "    deps = [\":com_google_dagger_compiler\"],",
        ")",
    ]),
)

java_import_external(
    name = "com_google_dagger_producers",
    jar_sha256 = "96f950bc4b94d013b0c538632a4bc630f33eda8b01f63ae752b76c5e48783859",
    jar_urls = [
        "https://mirror.bazel.build/repo1.maven.org/maven2/com/google/dagger/dagger-producers/2.14.1/dagger-producers-2.14.1.jar",
        "https://repo1.maven.org/maven2/com/google/dagger/dagger-producers/2.14.1/dagger-producers-2.14.1.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
    deps = [
        "@com_google_dagger//:runtime",
        "@com_google_guava",
    ],
    generated_rule_name = "runtime",
    extra_build_file_content = "\n".join([
        "java_library(",
        "    name = \"com_google_dagger_producers\",",
        "    exported_plugins = [\"@com_google_dagger_compiler//:ComponentProcessor\"],",
        "    exports = [",
        "        \":runtime\",",
        "        \"@com_google_dagger//:runtime\",",
        "        \"@javax_inject\",",
        "    ],",
        ")",
    ]),
)

java_import_external(
    name = "com_google_dagger_spi",
    jar_sha256 = "6a20d6c6620fefe50747e9e910e0d0c178cf39d76b67ccffb505ac9a167302cb",
    jar_urls = [
        "https://mirror.bazel.build/repo1.maven.org/maven2/com/google/dagger/dagger-spi/2.14.1/dagger-spi-2.14.1.jar",
        "https://repo1.maven.org/maven2/com/google/dagger/dagger-spi/2.14.1/dagger-spi-2.14.1.jar",
    ],
    licenses = ["notice"],  # Apache 2.0
)

# End TODO

load("@io_bazel_rules_closure//closure:defs.bzl", "closure_repositories")

closure_repositories()
