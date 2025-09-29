---
title: 'Introduction of Multi-agents system(In any task you want)'
description: ""
date: "2025-09-29"
tags:
  - tag-one
---

# Introduction of Multi-agents system(In any task you want)

Multi-Agent System（多智能体系统）概览
1. 什么是 Multi-Agent System（多智能体系统, MAS）？

多智能体系统（MAS）指由多个相对自治的 智能体（agent） 组成、在共享环境中交互、协作或竞争以达成个体或群体目标的计算系统。
它关注的并非单个智能体的最优行为，而是 群体层面的组织、协调与涌现行为。
直观理解：可把 LLM 作为多个“角色”来 模拟团队/部门协作，共同完成任务。

2. 典型应用与问题类型

现实分布式问题：电网调度、智慧交通、供应链、灾害应对等——天然具备分布式、动态与不确定特性，单体系统难以兼顾全局最优与鲁棒性。

研究方向示例：generation、translation、repair、judge 等。

3. 多智能体的核心概念
3.1 智能体（Agent）

在环境中 感知（Perception）—决策（Deliberation/Policy）—行动（Action） 的计算实体。

典型特性：自治性、反应性、前瞻性（主动性）、社会性（可交互）。

3.2 环境（Environment）

智能体感知与行动的客体；可为 完全/部分可观测、确定/随机、静态/动态、连续/离散。

3.3 交互（Interaction）

形式包括 通信、协商、竞争、合作、博弈 等。

3.4 组织（Organization）

角色、层级、规范、协议与团队结构 的总和。

3.5 目标（Goals/Utility）

个体目标与全局社会福利可能 一致或冲突，涉及 机制设计。最终目的应指向 任务完成与效用最优。

4. 系统构成与典型架构
4.1 智能体内部架构

反射式/行为式（Reactive）：如 subsumption（抑制/分层行为），响应快但规划能力弱。

BDI（Belief–Desire–Intention）：以信念/愿望/意图建模理性决策，适合可解释规划场景。

学习型：基于 RL/监督/自监督；在 MARL 中可共享或独立训练策略。

LLM-Agent：以 大语言模型 为核心，结合 工具调用、记忆、检索、反思与执行器，擅长复杂推理与开放环境任务。

4.2 多智能体体系结构

集中式编排（Orchestrator）：中央调度（如 Planner/Router）分配任务；全局视角强，但有 单点瓶颈。

分布式协同（Peer-to-Peer）：各智能体平等交互；弹性高但 协议复杂。

分层/混合式（Hierarchical/Hybrid）：上层规划、下层执行；兼顾全局与局部效率。

黑板（Blackboard）/共享记忆：通过公共工作区交换假设与部分解。

4.3 通信与协调机制

通信语言/协议：早期如 KQML、FIPA-ACL；工程上常用 MQ/HTTP/gRPC 与结构化消息（JSON/Proto）。

4.4 协调方式

契约网（Contract Net）与拍卖/竞价：适合任务分派与资源竞争。

协商/投票/共识：如 Paxos/Raft 或多方投票策略。

编队/编组与角色切换：队形控制、动态角色分配。

机制设计：通过激励相容规则引导个体理性行为产生期望群体结果。

组织结构：层级（Hierarchy）、合弄（Holarchy）、团队/联盟（Team/Coalition）、基于角色与规范（Roles & Norms） 的社会化组织。

4.5 多智能体强化学习（MARL）要点

非平稳性：他人策略变化使环境对单体呈现非静态，训练更难。

训练-执行范式：集中式训练、分布式执行（CTDE） 常见。

4.6 方法族（举例）

值分解：VDN、QMIX 将全局价值分解为个体价值。

Actor-Critic：如 MADDPG（集中式 Critic、分布式 Actor）。

对手建模/博弈学习：纳什均衡、可转移策略、元学习。

关键挑战：信用分配、可扩展性、部分可观测、探索-利用平衡、通信带宽与延迟。

5. LLM 驱动的多智能体范式（Main Focus）
5.1 角色分工

Planner（计划）

Researcher（检索/分析）

Coder/Executor（工具执行）

Critic/Verifier（审查校验）

Refiner（修复）

5.2 协作模式

辩论/对话式求解（Debate/Deliberation）：互评提升推理稳健性。

反思与记忆（Reflection/Memory）：总结经验、长期记忆库、外部知识检索。

图式编排（Graph-of-Agents）：以 DAG/状态机 显式表达任务流程。

5.3 工程要点

Prompt 模板化

工具/数据库/代码执行器接入

消息路由与缓存

成本与延迟控制

安全防护（越权/数据泄露/注入）

6. 经典论文/工作推荐 

AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation

CAMEL: Communicative Agents for “Mind” Exploration of LLM Society

Improving Factuality and Reasoning in Language Models through Multi-Agent Debate

Should We Be Going MAD? A Look at Multi-Agent Debate

Reflexion: Language Agents with Verbal Reinforcement Learning

Self-Refine: Iterative Refinement with Self-Feedback

Language Agents as Optimizable Graphs (GPTSwarm)

Graph of Thoughts: Solving Elaborate Problems with LLMs
