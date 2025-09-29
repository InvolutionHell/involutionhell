---
title: 'Introduction of Multi-agents system(In any task you want)'
description: ""
date: "2025-09-29"
tags:
  - tag-one
---

# Introduction of Multi-agents system(In any task you want)

1. 什么是 Multi-Agent System（多智能体系统）？

多智能体系统（MAS）指由多个相对自治的“智能体（agent）”组成、在共享环境中交互、协作或竞争以达成个体或群体目标的计算系统。它关注的不是单个智能体的最优行为，而是群体层面的组织、协调与涌现行为。你可以理解为你使用LLM去模拟一个团队或者是一个真实存在的部门进行合作和任务的完成。

2.可能应用的问题或者任务是什么？

  （1）很多现实问题（电网调度、智慧交通、供应链、灾害应对）天然是分布式、动态且不确定，单体系统难以全局最优与鲁棒的任务都可以用多智能体进行合作。
  （2）research topic：Generation，translation，repair，judge...


3. 那么，多智能体的核心概念是什么？

  （1）智能体（Agent）：在环境中感知（Perception）、决策（Deliberation/Policy）、行动（Action）的计算实体。典型特性： 自治性、反应性、前瞻性（主动性）、社会性（可交互）。
      环境（Environment）：智能体感知与行动的客体，可为完全/部分可观测、确定/随机、静态/动态、连续/离散。
      交互（Interaction）：通信、协商、竞争、合作、博弈等。
      组织（Organization）：角色、层级、规范、协议与团队结构的总和。
      目标（Goals/Utility）：个体目标与全局社会福利可能一致或冲突，牵涉到机制设计。最终的目的应当是针对当前的任务的完成。

4. 系统构成与典型架构
   
1) 智能体内部架构

反射式/行为式（Reactive）：如 subsumption（抑制/分层行为），快但缺少计划。

计划-信念-愿望（BDI）：以 Belief/Desire/Intention 建模理性决策，适合需要可解释规划的场景。

学习型：基于 RL/监督/自监督学习；在 MARL 中共享/独立训练策略。

LLM-Agent：以大语言模型为核心，结合工具调用、记忆、检索、反思与执行器，擅长复杂推理与开放环境任务。

2) 多智能体体系结构

集中式编排（Orchestrator）：中央调度（Planner/Router）分配任务，优点是全局视角强，缺点是单点瓶颈。

分布式协同（Peer-to-Peer）：各智能体平等交互，弹性高但协议复杂。

分层/混合式（Hierarchical/Hybrid）：上层规划、下层执行，兼顾全局与局部效率。

黑板（Blackboard）/共享记忆：通过公共工作区交换假设与部分解。

3）通信与协调机制

通信语言与协议：早期有 KQML、FIPA-ACL；工程上常用基于消息队列（MQ/HTTP/gRPC）的结构化消息（JSON/Proto）。

4）协调方式：

契约网（Contract Net）与拍卖/竞价：适合任务分派与资源竞争。

协商/投票/共识：如分布式一致性（Paxos/Raft）或多方投票策略。

编队/编组与角色切换：队形控制、动态角色分配。

机制设计：通过激励兼容的规则让个体理性行为产生期望的群体结果。

组织结构：层级（Hierarchy）、合弄（Holarchy）、团队/联盟（Team/Coalition）、基于角色与规范（Roles & Norms）的社会化组织。

5）多智能体强化学习（MARL）要点

非平稳性：他人策略变化导致环境对单体“非静态”，训练更难。

训练-执行范式：集中式训练、分布式执行（CTDE）**较常见。

6）方法族：

值分解：VDN、QMIX 把全局价值分解为个体价值。

Actor-Critic：如 MADDPG（集中式 Critic、分布式 Actor）。

对手建模/博弈学习：纳什均衡、可转移策略、元学习。

关键挑战：信用分配、可扩展性、部分可观测、探索-利用平衡、通信带宽与延迟。

7）LLM 驱动的多智能体范式（main focus on this)

角色分工：Planner（计划）、Researcher（检索/分析）、Coder/Executor（工具执行）、Critic/Verifier（审查校验）、Refiner（修复）。

  协作模式：
  
  辩论/对话式求解（Debate/Deliberation）：通过互评提升推理稳健性。
  
  反思与记忆（Reflection/Memory）：总结经验、长期记忆库、外部知识检索。
  
  图式编排（Graph-of-Agents）：用有向图把任务流程显式化（如 DAG/状态机）。
  
  工程要点：提示（prompt）模板化、工具/数据库/代码执行器接入、消息路由、缓存、成本与延迟控制、安全防护（越权/数据泄露/注入）。


5.经典论文推荐：

(1)AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
(2)CAMEL: Communicative Agents for “Mind” Exploration of LLM Society
(3)Improving Factuality and Reasoning in Language Models through Multi-Agent Debate
(4)Should We Be Going MAD? A Look at Multi-Agent Debate
(5)Reflexion: Language Agents with Verbal Reinforcement Learning
(6)Self-Refine: Iterative Refinement with Self-Feedback
(7)Language Agents as Optimizable Graphs (GPTSwarm)
(8)Graph of Thoughts: Solving Elaborate Problems with LLMs
