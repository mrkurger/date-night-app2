# Workflow Error Analysis Report

Generated on: 2025-04-16T15:12:43.241Z

## Table of Contents

- [angular-tests](#angular-tests)
- [dependabot-updates](#dependabot-updates)
- [security-alerts-report](#security-alerts-report)
- [server-tests](#server-tests)
- [sync-github-insights](#sync-github-insights)
- [sync-test-reports](#sync-test-reports)
- [sync-workflow-error-logs](#sync-workflow-error-logs)

## angular-tests

### Job: e2e--22-x- (Run ID: 14482934212)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14482934212)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14483056251)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14483056251)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14483628053)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14483628053)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14484838491)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14484838491)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14485836014)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14485836014)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14487328371)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:38:45.8783826Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:38:59.6669802Z 
2025-04-16T07:38:59.6672610Z > date-night-app@1.0.0 prepare
2025-04-16T07:38:59.6676196Z > husky
2025-04-16T07:38:59.6676383Z 
2025-04-16T07:38:59.6820483Z sh: 1: husky: not found
2025-04-16T07:38:59.6858715Z npm error code 127
2025-04-16T07:38:59.6859701Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:38:59.6860438Z npm error command failed
2025-04-16T07:38:59.6860939Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14487328371)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:38:39.8844490Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:38:53.7602759Z 
2025-04-16T07:38:53.7613075Z > date-night-app@1.0.0 prepare
2025-04-16T07:38:53.7615116Z > husky
2025-04-16T07:38:53.7616807Z 
2025-04-16T07:38:53.7758401Z sh: 1: husky: not found
2025-04-16T07:38:53.7799311Z npm error code 127
2025-04-16T07:38:53.7805256Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:38:53.7806683Z npm error command failed
2025-04-16T07:38:53.7807492Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14487328371)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:38:42.7005289Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:38:57.0044074Z 
2025-04-16T07:38:57.0048667Z > date-night-app@1.0.0 prepare
2025-04-16T07:38:57.0065241Z > husky
2025-04-16T07:38:57.0068827Z 
2025-04-16T07:38:57.0195396Z sh: 1: husky: not found
2025-04-16T07:38:57.0229099Z npm error code 127
2025-04-16T07:38:57.0232768Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:38:57.0246038Z npm error command failed
2025-04-16T07:38:57.0246608Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14487584048)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:53:51.4072099Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:54:06.2165803Z 
2025-04-16T07:54:06.2167939Z > date-night-app@1.0.0 prepare
2025-04-16T07:54:06.2169567Z > husky
2025-04-16T07:54:06.2171717Z 
2025-04-16T07:54:06.2319808Z sh: 1: husky: not found
2025-04-16T07:54:06.2349848Z npm error code 127
2025-04-16T07:54:06.2350897Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:54:06.2357401Z npm error command failed
2025-04-16T07:54:06.2357912Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14487584048)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:53:43.0306479Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:53:56.8558130Z 
2025-04-16T07:53:56.8566664Z > date-night-app@1.0.0 prepare
2025-04-16T07:53:56.8567418Z > husky
2025-04-16T07:53:56.8567766Z 
2025-04-16T07:53:56.8705569Z sh: 1: husky: not found
2025-04-16T07:53:56.8739275Z npm error code 127
2025-04-16T07:53:56.8740083Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:53:56.8744285Z npm error command failed
2025-04-16T07:53:56.8751275Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14487584048)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:53:44.4151403Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:53:58.5274796Z 
2025-04-16T07:53:58.5278830Z > date-night-app@1.0.0 prepare
2025-04-16T07:53:58.5279948Z > husky
2025-04-16T07:53:58.5280687Z 
2025-04-16T07:53:58.5444626Z sh: 1: husky: not found
2025-04-16T07:53:58.5483305Z npm error code 127
2025-04-16T07:53:58.5485892Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:53:58.5488385Z npm error command failed
2025-04-16T07:53:58.5491064Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14487862937)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:09:35.7183734Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:09:49.2634167Z 
2025-04-16T08:09:49.2642256Z > date-night-app@1.0.0 prepare
2025-04-16T08:09:49.2643018Z > husky
2025-04-16T08:09:49.2643216Z 
2025-04-16T08:09:49.2784006Z sh: 1: husky: not found
2025-04-16T08:09:49.2815215Z npm error code 127
2025-04-16T08:09:49.2816281Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:09:49.2817336Z npm error command failed
2025-04-16T08:09:49.2818763Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14487862937)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:09:37.5234253Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:09:51.8647764Z 
2025-04-16T08:09:51.8650347Z > date-night-app@1.0.0 prepare
2025-04-16T08:09:51.8656690Z > husky
2025-04-16T08:09:51.8659141Z 
2025-04-16T08:09:51.8794931Z sh: 1: husky: not found
2025-04-16T08:09:51.8826718Z npm error code 127
2025-04-16T08:09:51.8831976Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:09:51.8832989Z npm error command failed
2025-04-16T08:09:51.8835686Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14487862937)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:09:37.6070814Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:09:51.1879709Z 
2025-04-16T08:09:51.1889826Z > date-night-app@1.0.0 prepare
2025-04-16T08:09:51.1890521Z > husky
2025-04-16T08:09:51.1890708Z 
2025-04-16T08:09:51.2026020Z sh: 1: husky: not found
2025-04-16T08:09:51.2058321Z npm error code 127
2025-04-16T08:09:51.2059532Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:09:51.2060822Z npm error command failed
2025-04-16T08:09:51.2062119Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14488138321)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:24:22.5198379Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:24:36.5355382Z 
2025-04-16T08:24:36.5356043Z > date-night-app@1.0.0 prepare
2025-04-16T08:24:36.5356533Z > husky
2025-04-16T08:24:36.5356711Z 
2025-04-16T08:24:36.5498105Z sh: 1: husky: not found
2025-04-16T08:24:36.5528148Z npm error code 127
2025-04-16T08:24:36.5561826Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:24:36.5565700Z npm error command failed
2025-04-16T08:24:36.5566469Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14488138321)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:24:22.5102556Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:24:36.2875143Z 
2025-04-16T08:24:36.2876249Z > date-night-app@1.0.0 prepare
2025-04-16T08:24:36.2876778Z > husky
2025-04-16T08:24:36.2876989Z 
2025-04-16T08:24:36.3020106Z sh: 1: husky: not found
2025-04-16T08:24:36.3054907Z npm error code 127
2025-04-16T08:24:36.3072041Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:24:36.3073061Z npm error command failed
2025-04-16T08:24:36.3074154Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14488138321)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:24:22.5288865Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:24:35.6494232Z 
2025-04-16T08:24:35.6495390Z > date-night-app@1.0.0 prepare
2025-04-16T08:24:35.6516514Z > husky
2025-04-16T08:24:35.6516720Z 
2025-04-16T08:24:35.6642671Z sh: 1: husky: not found
2025-04-16T08:24:35.6679456Z npm error code 127
2025-04-16T08:24:35.6680177Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:24:35.6680857Z npm error command failed
2025-04-16T08:24:35.6681328Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14488237430)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:29:41.4693439Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:29:55.9105727Z 
2025-04-16T08:29:55.9106866Z > date-night-app@1.0.0 prepare
2025-04-16T08:29:55.9115575Z > husky
2025-04-16T08:29:55.9117136Z 
2025-04-16T08:29:55.9253517Z sh: 1: husky: not found
2025-04-16T08:29:55.9303127Z npm error code 127
2025-04-16T08:29:55.9304111Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:29:55.9305030Z npm error command failed
2025-04-16T08:29:55.9305620Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14488237430)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:29:35.5176738Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:29:49.6935696Z 
2025-04-16T08:29:49.6943904Z > date-night-app@1.0.0 prepare
2025-04-16T08:29:49.6946509Z > husky
2025-04-16T08:29:49.6948504Z 
2025-04-16T08:29:49.7080647Z sh: 1: husky: not found
2025-04-16T08:29:49.7111848Z npm error code 127
2025-04-16T08:29:49.7125731Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:29:49.7126430Z npm error command failed
2025-04-16T08:29:49.7127022Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14488237430)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:29:37.4849811Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:29:52.0502299Z 
2025-04-16T08:29:52.0503405Z > date-night-app@1.0.0 prepare
2025-04-16T08:29:52.0504458Z > husky
2025-04-16T08:29:52.0504903Z 
2025-04-16T08:29:52.0654089Z sh: 1: husky: not found
2025-04-16T08:29:52.0690542Z npm error code 127
2025-04-16T08:29:52.0692609Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:29:52.0719298Z npm error command failed
2025-04-16T08:29:52.0719935Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14488479923)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:42:28.2456838Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:42:42.3215971Z 
2025-04-16T08:42:42.3216981Z > date-night-app@1.0.0 prepare
2025-04-16T08:42:42.3217453Z > husky
2025-04-16T08:42:42.3217625Z 
2025-04-16T08:42:42.3366023Z sh: 1: husky: not found
2025-04-16T08:42:42.3401220Z npm error code 127
2025-04-16T08:42:42.3424929Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:42:42.3429050Z npm error command failed
2025-04-16T08:42:42.3430134Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14488479923)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:42:32.0714615Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:42:45.8408616Z 
2025-04-16T08:42:45.8414201Z > date-night-app@1.0.0 prepare
2025-04-16T08:42:45.8414913Z > husky
2025-04-16T08:42:45.8432614Z 
2025-04-16T08:42:45.8561585Z sh: 1: husky: not found
2025-04-16T08:42:45.8598776Z npm error code 127
2025-04-16T08:42:45.8600672Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:42:45.8601362Z npm error command failed
2025-04-16T08:42:45.8601822Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14488479923)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T08:42:24.7640261Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T08:42:39.6539553Z 
2025-04-16T08:42:39.6540239Z > date-night-app@1.0.0 prepare
2025-04-16T08:42:39.6540772Z > husky
2025-04-16T08:42:39.6540965Z 
2025-04-16T08:42:39.6697452Z sh: 1: husky: not found
2025-04-16T08:42:39.6746933Z npm error code 127
2025-04-16T08:42:39.6747837Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T08:42:39.6748726Z npm error command failed
2025-04-16T08:42:39.6749404Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14488849586)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:01:47.5863891Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:02:00.7760238Z 
2025-04-16T09:02:00.7764980Z > date-night-app@1.0.0 prepare
2025-04-16T09:02:00.7768041Z > husky
2025-04-16T09:02:00.7770329Z 
2025-04-16T09:02:00.7907705Z sh: 1: husky: not found
2025-04-16T09:02:00.7943513Z npm error code 127
2025-04-16T09:02:00.7959359Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:02:00.7960232Z npm error command failed
2025-04-16T09:02:00.7960698Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14488849586)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:01:52.2105495Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:02:06.7521658Z 
2025-04-16T09:02:06.7539253Z > date-night-app@1.0.0 prepare
2025-04-16T09:02:06.7539947Z > husky
2025-04-16T09:02:06.7540324Z 
2025-04-16T09:02:06.7677398Z sh: 1: husky: not found
2025-04-16T09:02:06.7728674Z npm error code 127
2025-04-16T09:02:06.7729424Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:02:06.7730116Z npm error command failed
2025-04-16T09:02:06.7730603Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14488849586)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:01:45.6987494Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:01:58.8908022Z 
2025-04-16T09:01:58.8910067Z > date-night-app@1.0.0 prepare
2025-04-16T09:01:58.8911006Z > husky
2025-04-16T09:01:58.8911700Z 
2025-04-16T09:01:58.9052857Z sh: 1: husky: not found
2025-04-16T09:01:58.9115275Z npm error code 127
2025-04-16T09:01:58.9116346Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:01:58.9117203Z npm error command failed
2025-04-16T09:01:58.9117838Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14489457633)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:32:03.9775721Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:32:17.0448381Z 
2025-04-16T09:32:17.0450894Z > date-night-app@1.0.0 prepare
2025-04-16T09:32:17.0451675Z > husky
2025-04-16T09:32:17.0453896Z 
2025-04-16T09:32:17.0608117Z sh: 1: husky: not found
2025-04-16T09:32:17.0660744Z npm error code 127
2025-04-16T09:32:17.0661906Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:32:17.0667517Z npm error command failed
2025-04-16T09:32:17.0670453Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14489457633)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:31:57.1267780Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:32:11.0445621Z 
2025-04-16T09:32:11.0446689Z > date-night-app@1.0.0 prepare
2025-04-16T09:32:11.0451590Z > husky
2025-04-16T09:32:11.0452001Z 
2025-04-16T09:32:11.0589622Z sh: 1: husky: not found
2025-04-16T09:32:11.0651954Z npm error code 127
2025-04-16T09:32:11.0652945Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:32:11.0653984Z npm error command failed
2025-04-16T09:32:11.0654752Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14489457633)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T09:31:57.0002442Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T09:32:10.8394007Z 
2025-04-16T09:32:10.8400728Z > date-night-app@1.0.0 prepare
2025-04-16T09:32:10.8407507Z > husky
2025-04-16T09:32:10.8410958Z 
2025-04-16T09:32:10.8530530Z sh: 1: husky: not found
2025-04-16T09:32:10.8582702Z npm error code 127
2025-04-16T09:32:10.8583535Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T09:32:10.8584354Z npm error command failed
2025-04-16T09:32:10.8584941Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14490404236)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T10:22:29.5636785Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T10:22:42.7307845Z 
2025-04-16T10:22:42.7309543Z > date-night-app@1.0.0 prepare
2025-04-16T10:22:42.7310023Z > husky
2025-04-16T10:22:42.7310202Z 
2025-04-16T10:22:42.7454667Z sh: 1: husky: not found
2025-04-16T10:22:42.7486769Z npm error code 127
2025-04-16T10:22:42.7487567Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T10:22:42.7488298Z npm error command failed
2025-04-16T10:22:42.7488770Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14490404236)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T10:22:28.8494380Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T10:22:43.4480804Z 
2025-04-16T10:22:43.4482997Z > date-night-app@1.0.0 prepare
2025-04-16T10:22:43.4489402Z > husky
2025-04-16T10:22:43.4491642Z 
2025-04-16T10:22:43.4624352Z sh: 1: husky: not found
2025-04-16T10:22:43.4657029Z npm error code 127
2025-04-16T10:22:43.4659180Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T10:22:43.4660151Z npm error command failed
2025-04-16T10:22:43.4660861Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14490404236)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T10:22:29.1243077Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T10:22:44.1445244Z 
2025-04-16T10:22:44.1450020Z > date-night-app@1.0.0 prepare
2025-04-16T10:22:44.1454278Z > husky
2025-04-16T10:22:44.1458155Z 
2025-04-16T10:22:44.1587370Z sh: 1: husky: not found
2025-04-16T10:22:44.1620355Z npm error code 127
2025-04-16T10:22:44.1622595Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T10:22:44.1623599Z npm error command failed
2025-04-16T10:22:44.1625632Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14491544593)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:25:17.3967935Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:25:32.3736080Z 
2025-04-16T11:25:32.3741792Z > date-night-app@1.0.0 prepare
2025-04-16T11:25:32.3743637Z > husky
2025-04-16T11:25:32.3745020Z 
2025-04-16T11:25:32.3883539Z sh: 1: husky: not found
2025-04-16T11:25:32.3921903Z npm error code 127
2025-04-16T11:25:32.3923001Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:25:32.3924032Z npm error command failed
2025-04-16T11:25:32.3928924Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14491544593)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:25:20.8194461Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:25:35.4763643Z 
2025-04-16T11:25:35.4764531Z > date-night-app@1.0.0 prepare
2025-04-16T11:25:35.4764996Z > husky
2025-04-16T11:25:35.4765161Z 
2025-04-16T11:25:35.4910880Z sh: 1: husky: not found
2025-04-16T11:25:35.4952176Z npm error code 127
2025-04-16T11:25:35.4953834Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:25:35.4954506Z npm error command failed
2025-04-16T11:25:35.4955010Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14491544593)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:25:12.9166521Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:25:27.1327915Z 
2025-04-16T11:25:27.1332586Z > date-night-app@1.0.0 prepare
2025-04-16T11:25:27.1351550Z > husky
2025-04-16T11:25:27.1352362Z 
2025-04-16T11:25:27.1476230Z sh: 1: husky: not found
2025-04-16T11:25:27.1511184Z npm error code 127
2025-04-16T11:25:27.1512125Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:25:27.1512805Z npm error command failed
2025-04-16T11:25:27.1515782Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14491563458)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:26:21.6412913Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:26:35.7436355Z 
2025-04-16T11:26:35.7438478Z > date-night-app@1.0.0 prepare
2025-04-16T11:26:35.7439402Z > husky
2025-04-16T11:26:35.7441724Z 
2025-04-16T11:26:35.7580495Z sh: 1: husky: not found
2025-04-16T11:26:35.7612325Z npm error code 127
2025-04-16T11:26:35.7619924Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:26:35.7620910Z npm error command failed
2025-04-16T11:26:35.7623412Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14491563458)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:26:21.9363227Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:26:36.0892307Z 
2025-04-16T11:26:36.0893527Z > date-night-app@1.0.0 prepare
2025-04-16T11:26:36.0900479Z > husky
2025-04-16T11:26:36.0905711Z 
2025-04-16T11:26:36.1046014Z sh: 1: husky: not found
2025-04-16T11:26:36.1086585Z npm error code 127
2025-04-16T11:26:36.1088878Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:26:36.1090065Z npm error command failed
2025-04-16T11:26:36.1091778Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14491563458)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:26:22.9275377Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:26:37.4436941Z 
2025-04-16T11:26:37.4437593Z > date-night-app@1.0.0 prepare
2025-04-16T11:26:37.4446840Z > husky
2025-04-16T11:26:37.4447268Z 
2025-04-16T11:26:37.4579244Z sh: 1: husky: not found
2025-04-16T11:26:37.4611826Z npm error code 127
2025-04-16T11:26:37.4619730Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:26:37.4624546Z npm error command failed
2025-04-16T11:26:37.4625696Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14493901639)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:26:56.4706816Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:27:11.8526442Z 
2025-04-16T13:27:11.8528660Z > date-night-app@1.0.0 prepare
2025-04-16T13:27:11.8531741Z > husky
2025-04-16T13:27:11.8533644Z 
2025-04-16T13:27:11.8678594Z sh: 1: husky: not found
2025-04-16T13:27:11.8714775Z npm error code 127
2025-04-16T13:27:11.8721284Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:27:11.8722760Z npm error command failed
2025-04-16T13:27:11.8723369Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14493901639)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:26:47.5076498Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:27:02.7385414Z 
2025-04-16T13:27:02.7387577Z > date-night-app@1.0.0 prepare
2025-04-16T13:27:02.7388303Z > husky
2025-04-16T13:27:02.7390477Z 
2025-04-16T13:27:02.7533654Z sh: 1: husky: not found
2025-04-16T13:27:02.7583390Z npm error code 127
2025-04-16T13:27:02.7588168Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:27:02.7593129Z npm error command failed
2025-04-16T13:27:02.7593642Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14493901639)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:26:50.4563324Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:27:04.7329800Z 
2025-04-16T13:27:04.7330681Z > date-night-app@1.0.0 prepare
2025-04-16T13:27:04.7331164Z > husky
2025-04-16T13:27:04.7331339Z 
2025-04-16T13:27:04.7473990Z sh: 1: husky: not found
2025-04-16T13:27:04.7507616Z npm error code 127
2025-04-16T13:27:04.7508679Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:27:04.7509760Z npm error command failed
2025-04-16T13:27:04.7510749Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14494454456)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:52:29.0777535Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:52:43.3483036Z 
2025-04-16T13:52:43.3484125Z > date-night-app@1.0.0 prepare
2025-04-16T13:52:43.3485828Z > husky
2025-04-16T13:52:43.3486936Z 
2025-04-16T13:52:43.3664211Z sh: 1: husky: not found
2025-04-16T13:52:43.3710431Z npm error code 127
2025-04-16T13:52:43.3711846Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:52:43.3716192Z npm error command failed
2025-04-16T13:52:43.3717009Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14494454456)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:52:28.0384485Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:52:42.3004997Z 
2025-04-16T13:52:42.3009927Z > date-night-app@1.0.0 prepare
2025-04-16T13:52:42.3020428Z > husky
2025-04-16T13:52:42.3023972Z 
2025-04-16T13:52:42.3157487Z sh: 1: husky: not found
2025-04-16T13:52:42.3194769Z npm error code 127
2025-04-16T13:52:42.3195883Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:52:42.3196945Z npm error command failed
2025-04-16T13:52:42.3201176Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14494454456)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:52:37.0537860Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:52:51.8516828Z 
2025-04-16T13:52:51.8521790Z > date-night-app@1.0.0 prepare
2025-04-16T13:52:51.8525905Z > husky
2025-04-16T13:52:51.8529220Z 
2025-04-16T13:52:51.8666559Z sh: 1: husky: not found
2025-04-16T13:52:51.8706283Z npm error code 127
2025-04-16T13:52:51.8712021Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:52:51.8716880Z npm error command failed
2025-04-16T13:52:51.8719184Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14494881575)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T14:12:28.0947633Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T14:12:43.3529509Z 
2025-04-16T14:12:43.3530229Z > date-night-app@1.0.0 prepare
2025-04-16T14:12:43.3530679Z > husky
2025-04-16T14:12:43.3534662Z 
2025-04-16T14:12:43.3675503Z sh: 1: husky: not found
2025-04-16T14:12:43.3716582Z npm error code 127
2025-04-16T14:12:43.3725871Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T14:12:43.3729195Z npm error command failed
2025-04-16T14:12:43.3731328Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14494881575)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T14:12:24.5743350Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T14:12:40.8243279Z 
2025-04-16T14:12:40.8244238Z > date-night-app@1.0.0 prepare
2025-04-16T14:12:40.8246432Z > husky
2025-04-16T14:12:40.8246816Z 
2025-04-16T14:12:40.8388116Z sh: 1: husky: not found
2025-04-16T14:12:40.8423665Z npm error code 127
2025-04-16T14:12:40.8433644Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T14:12:40.8436096Z npm error command failed
2025-04-16T14:12:40.8438212Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14494881575)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T14:12:27.8640135Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T14:12:43.1688220Z 
2025-04-16T14:12:43.1698578Z > date-night-app@1.0.0 prepare
2025-04-16T14:12:43.1713390Z > husky
2025-04-16T14:12:43.1716846Z 
2025-04-16T14:12:43.1837340Z sh: 1: husky: not found
2025-04-16T14:12:43.1874346Z npm error code 127
2025-04-16T14:12:43.1880179Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T14:12:43.1882771Z npm error command failed
2025-04-16T14:12:43.1885534Z npm error command sh -c husky
```

### Job: e2e--22-x- (Run ID: 14495131635)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14495131635)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14495580435)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14495580435)

No common errors detected in this job.

### Job: e2e--22-x- (Run ID: 14495733951)

No common errors detected in this job.

### Job: test--22-x- (Run ID: 14495733951)

No common errors detected in this job.

## dependabot-updates

### Job: dependabot (Run ID: 14406928734)

No common errors detected in this job.

### Job: dependabot (Run ID: 14480207800)

No common errors detected in this job.

### Job: dependabot (Run ID: 14480211018)

No common errors detected in this job.

### Job: dependabot (Run ID: 14481993874)

No common errors detected in this job.

### Job: dependabot (Run ID: 14481996730)

No common errors detected in this job.

### Job: dependabot (Run ID: 14487333125)

No common errors detected in this job.

### Job: dependabot (Run ID: 14487537956)

No common errors detected in this job.

### Job: dependabot (Run ID: 14491549806)

No common errors detected in this job.

### Job: dependabot (Run ID: 14493902595)

No common errors detected in this job.

### Job: dependabot (Run ID: 14493902598)

No common errors detected in this job.

### Job: dependabot (Run ID: 14493903598)

No common errors detected in this job.

### Job: dependabot (Run ID: 14494144849)

No common errors detected in this job.

### Job: dependabot (Run ID: 14494145040)

No common errors detected in this job.

### Job: dependabot (Run ID: 14494189299)

No common errors detected in this job.

### Job: dependabot (Run ID: 14494189650)

No common errors detected in this job.

## security-alerts-report

### Job: generate-report (Run ID: 14494265282)

No common errors detected in this job.

## server-tests

### Job: test--22-x- (Run ID: 14485836001)

No common errors detected in this job.

### Job: lint--22-x- (Run ID: 14487532942)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:50:36.3026078Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:50:39.8969986Z 
2025-04-16T07:50:39.8970789Z > date-night-app@1.0.0 prepare
2025-04-16T07:50:39.8971265Z > husky
2025-04-16T07:50:39.8971431Z 
2025-04-16T07:50:39.9068976Z sh: 1: husky: not found
2025-04-16T07:50:39.9117198Z npm error code 127
2025-04-16T07:50:39.9118158Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:50:39.9119224Z npm error command failed
2025-04-16T07:50:39.9120307Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14487532942)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:50:45.5357764Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:50:48.9049638Z 
2025-04-16T07:50:48.9050539Z > date-night-app@1.0.0 prepare
2025-04-16T07:50:48.9051077Z > husky
2025-04-16T07:50:48.9051249Z 
2025-04-16T07:50:48.9133644Z sh: 1: husky: not found
2025-04-16T07:50:48.9174339Z npm error code 127
2025-04-16T07:50:48.9177978Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:50:48.9184679Z npm error command failed
2025-04-16T07:50:48.9185174Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14487584061)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:53:37.4487073Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:53:40.6270099Z 
2025-04-16T07:53:40.6273110Z > date-night-app@1.0.0 prepare
2025-04-16T07:53:40.6277303Z > husky
2025-04-16T07:53:40.6286478Z 
2025-04-16T07:53:40.6345215Z sh: 1: husky: not found
2025-04-16T07:53:40.6382484Z npm error code 127
2025-04-16T07:53:40.6393351Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:53:40.6394093Z npm error command failed
2025-04-16T07:53:40.6394592Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14487584061)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T07:53:49.3408068Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T07:53:53.0603313Z 
2025-04-16T07:53:53.0605419Z > date-night-app@1.0.0 prepare
2025-04-16T07:53:53.0606130Z > husky
2025-04-16T07:53:53.0620560Z 
2025-04-16T07:53:53.0687665Z sh: 1: husky: not found
2025-04-16T07:53:53.0726062Z npm error code 127
2025-04-16T07:53:53.0728214Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T07:53:53.0729150Z npm error command failed
2025-04-16T07:53:53.0731608Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14491544609)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:25:09.3298753Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:25:13.6789861Z 
2025-04-16T11:25:13.6790621Z > date-night-app@1.0.0 prepare
2025-04-16T11:25:13.6791075Z > husky
2025-04-16T11:25:13.6791228Z 
2025-04-16T11:25:13.6894347Z sh: 1: husky: not found
2025-04-16T11:25:13.6934826Z npm error code 127
2025-04-16T11:25:13.6938516Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:25:13.6969952Z npm error command failed
2025-04-16T11:25:13.6970998Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14491544609)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T11:25:21.6405593Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T11:25:26.6564057Z 
2025-04-16T11:25:26.6564724Z > date-night-app@1.0.0 prepare
2025-04-16T11:25:26.6565173Z > husky
2025-04-16T11:25:26.6565333Z 
2025-04-16T11:25:26.6684287Z sh: 1: husky: not found
2025-04-16T11:25:26.6757134Z npm error code 127
2025-04-16T11:25:26.6758769Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T11:25:26.6759614Z npm error command failed
2025-04-16T11:25:26.6760279Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14493901628)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:26:48.4312231Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:26:53.5346016Z 
2025-04-16T13:26:53.5347224Z > date-night-app@1.0.0 prepare
2025-04-16T13:26:53.5348019Z > husky
2025-04-16T13:26:53.5348466Z 
2025-04-16T13:26:53.5445005Z sh: 1: husky: not found
2025-04-16T13:26:53.5495518Z npm error code 127
2025-04-16T13:26:53.5496324Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:26:53.5497149Z npm error command failed
2025-04-16T13:26:53.5498133Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14493901628)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T13:26:49.9843367Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T13:26:54.2786433Z 
2025-04-16T13:26:54.2790650Z > date-night-app@1.0.0 prepare
2025-04-16T13:26:54.2801853Z > husky
2025-04-16T13:26:54.2805314Z 
2025-04-16T13:26:54.2936822Z sh: 1: husky: not found
2025-04-16T13:26:54.3026756Z npm error code 127
2025-04-16T13:26:54.3027753Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T13:26:54.3028566Z npm error command failed
2025-04-16T13:26:54.3029299Z npm error command sh -c husky
```

### Job: lint--22-x- (Run ID: 14494881619)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T14:12:19.8306100Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T14:12:23.6962998Z 
2025-04-16T14:12:23.6969751Z > date-night-app@1.0.0 prepare
2025-04-16T14:12:23.6971071Z > husky
2025-04-16T14:12:23.6971415Z 
2025-04-16T14:12:23.7054662Z sh: 1: husky: not found
2025-04-16T14:12:23.7088810Z npm error code 127
2025-04-16T14:12:23.7094463Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T14:12:23.7098395Z npm error command failed
2025-04-16T14:12:23.7104676Z npm error command sh -c husky
```

### Job: test--22-x- (Run ID: 14494881619)

#### Husky Not Found

**Description**: The husky package is not installed or not accessible

**Recommendation**: Update prepare script to skip husky in CI: "prepare": "[ -n "$CI" ] || husky"

**Error Context**:

```
2025-04-16T14:12:31.8112149Z npm warn deprecated eslint@8.56.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
2025-04-16T14:12:36.4313350Z 
2025-04-16T14:12:36.4314092Z > date-night-app@1.0.0 prepare
2025-04-16T14:12:36.4314581Z > husky
2025-04-16T14:12:36.4314749Z 
2025-04-16T14:12:36.4444093Z sh: 1: husky: not found
2025-04-16T14:12:36.4504436Z npm error code 127
2025-04-16T14:12:36.4505594Z npm error path /home/runner/work/date-night-app2/date-night-app2
2025-04-16T14:12:36.4506473Z npm error command failed
2025-04-16T14:12:36.4507452Z npm error command sh -c husky
```

## sync-github-insights

### Job: sync-insights (Run ID: 14493961666)

No common errors detected in this job.

### Job: sync-insights (Run ID: 14494259768)

No common errors detected in this job.

### Job: sync-insights (Run ID: 14494470565)

No common errors detected in this job.

## sync-test-reports

### Job: sync-reports (Run ID: 14493916276)

No common errors detected in this job.

### Job: sync-reports (Run ID: 14493922204)

No common errors detected in this job.

## sync-workflow-error-logs

### Job: sync-error-logs (Run ID: 14495610844)

No common errors detected in this job.

### Job: sync-error-logs (Run ID: 14495619567)

No common errors detected in this job.

### Job: sync-error-logs (Run ID: 14495767136)

No common errors detected in this job.

## Summary

### Error Types

- **Husky Not Found**: 52 occurrences
