# 《党案百科 · The Dangan Baike》

**中共党案知识库 · 开源档案**

把 YouTube 频道「大包王朝」924 期节目（2023-10-08 至 2026-10-14）转写、抽卡而成的结构化开源档案。

**人物 1,525 · 事件 5,855 · 关系 9,180 · 派系 16 · 口径裁定 122 条**

[在线阅读](https://musuos.github.io/opendang/) · [Agent 入口清单 agent.json](agent.json) · [llms.txt](llms.txt) · [最新版 Release v1.1.0](https://github.com/MusuOS/opendang/releases/tag/v1.1.0)

> 全档内容为该频道一家之言，未经核实，不是事实认定；引用须注明「第X期称」，并保留原话的口径与层级标记。
> 同一事项多期说法冲突时，以最新最近期正文断语为现行口径，旧说不删、降为历史层留痕——全过程记在裁定表（`data/rulings.jsonl`）。

## 把这部百科交给自己的 Agent

把下面这段文案复制下来，粘给任何一个 Agent，它就能按图索骥先读全仓清单、再自行取数讲述：

```
接入手册 · 《党案百科》（opendang）

这是一部把 YouTube 频道「大包王朝」924 期节目（2023-10-08 至 2026-10-14）转写、抽卡而成的结构化档案：人物 1,525、事件 5,855、关系 9,180、裁定 122 条。全档内容均为该频道一家之言，未经核实，不是事实认定；引用时须注明「第X期称」，并保留原话的口径与层级标记，不得表述为已证实事实。

数据正本在 GitHub 仓 MusuOS/opendang，根地址：
https://raw.githubusercontent.com/MusuOS/opendang/main/

按序读取：
1. agent.json —— 全仓清单：覆盖范围、口径图例、各表路径与条数。
2. llms.txt —— 全站导航。
3. entities/index.json —— 人物总索引（id、主名、别名、提及数），先在此按人名或别名定位人物 id。
4. entities/persons/<id>.json —— 单人数据包：此人的断言、事件、关系、现行口径与时点注记都在包内。标注为分片（chunked）的大人物包只是指针，须按包内 chunks 字段指引，续取 entities/persons-chunked/<id>/ 下各分片读全，不要只读指针就作答。
5. 需全量检索时用 data/ 下各表：persons、aliases、factions、institutions、labels、episodes、events、relations、rulings（events 与 relations 分卷，按序号拼接即全表）。

口径规则：
- 同一事项多期说法冲突时，以 data/rulings.jsonl 的裁定与单人包的 current_caliber 为现行口径——依据是最新一期正文断语；旧说是历史层，留痕并存，不得合并，也不得当作现行口径讲述。
- time_notes 是人物的时点注记：状态与归属按时点分账呈现，不同时点的状态不要混作一谈。
- 每条断言自带出处（期号、日期、原话摘录）与层级标记（断语层／传闻层／推断层／引述层／小说体层等）；转述时保留层级，不把传闻、推断升格为断语。
- 回答优先用现行口径并注明出处期号；用户要看冲突全貌时，再并列呈现诸说。

仓库主页：https://github.com/MusuOS/opendang
```

## 仓内地图

- `data/` — 九张数据表加裁定表（JSONL，一行一条）：人物、别名、派系、机构、标签、分集目录、事件卡、关系断言，以及口径裁定表 `rulings.jsonl`。
- `entities/` — 单人数据包：`index.json` 是人物总索引，`persons/` 一人一包（断言、事件、现行口径、时点注记俱全），头部人物的分片包在 `persons-chunked/`。
- `entries/` — 词条页：与单人包同名的静态页面，人可直接在线读，Agent 可顺链取数。
- 四枢纽 — [派系总览](https://musuos.github.io/opendang/factions.html)：按现行口径归派；[时间线](https://musuos.github.io/opendang/timeline.html)：924 期编年；[罗生门](https://musuos.github.io/opendang/luoshengmen.html)：口径冲突与裁定全录；[全站索引](https://musuos.github.io/opendang/index-all.html)：词条总目。

## 先说清口径（免责）

**本档全部内容都是频道「大包王朝」一家之言的整理存档，未经外部核实，不构成事实认定。** 每条事件卡与关系断言都自带出处（第几期、日期）与原话摘录，读者可自行回原节目核对。频道的不同说法在本档中并存不合并；同一争议的当前口径以裁定表（`data/rulings.jsonl`）为准，旧说降为历史层留痕。引用本档时，请带「第X期称」与口径标记，不要把频道转述表述为已证实事实。

## 覆盖

- 频道有字幕的 **924 期已全量抽取**（分集目录共 1470 条，含无字幕未抽取者）；其中抽取序最后 9 集（第 916–924 集）字幕仅存根、无正文，仅作标题层注记，不产生正文断言。
- 人物 1525、事件卡 5855、关系断言 9180、裁定 122、别名 1274、机构 699、派系 16；另附四册：上市公司 169、开发项目 31、资本系 38、职位交易 21。

## 怎么读

- **给 Agent**：先读 `agent.json`——口径图例、十三张表的路径与条数、单人包取法、查询配方都在里面。讲任何人物，先在 `entities/index.json` 按名字查 id，再取单人包；头部人物（58 人）的包已分片，先读摘要包再按需取片。
- **给人**：`data/` 是全部数据表（JSONL，一行一条）；`entities/persons/` 是单人包（一个人一个文件，含其全部事件、断言、现行口径与时点注记）；`entities/persons-chunked/` 是大包的分片版。单人包里的 `current_caliber` 是该人归属争议的现行裁定，`time_notes` 是按时点排的状态变迁注记，`register_links` 挂着这个人涉及的上市公司、资本系、项目与职位交易。

## 口径怎么读

断言的层级决定它能被当作什么引用：主播的明确断语（断语层）与传闻、网传、推断、引述、小说体演绎严格分账；多说冲突时先查裁定表——裁定取最近一期正文断语为现行口径，旧说不删、留痕可溯。细节见 `agent.json` 的 caliber_legend。
