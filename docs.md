# 1.对网页内容分段，并对每段的真实性进行打分API

- 请求方式：

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer pat_jYiTl8oV3vxCyOo4WQi447HJBF7mfEwhfSG23yxdFUKOfStS6kXg2BsMEB9SDdhk" \
-H "Content-Type: application/json" \
-d '{
  "parameters": {
    "in_url": "https://www.toutiao.com/article/7506264896355533321/?app=news_article&upstream_biz=search&utm_medium=search_ignore&enter_keyword=%23%E7%8E%8B%E6%A5%9A%E9%92%A6%E7%90%83%E6%8B%8D%E5%8F%97%E6%8D%9F%20%E5%9B%BD%E9%99%85%E4%B9%92%E8%81%94%E5%8F%91%E5%A3%B0%E6%98%8E%23&source=m_redirect",
    "require": "提取该页面文字内容"
  },
  "workflow_id": "7506442800905568306",
  "app_id": "7496080914184421416"
}'
```




- 返回值：

```json
{"code":0,"cost":"0","data":"{\"output\":\"[{\\\"comparison_details\\\":\\\"原始段落中事件主体、时间、地点、事件均与官方报道一致，发布时间官方未提及。\\\",\\\"justification\\\":\\\"该段落核心事件与官方报道一致，仅发布时间官方未提及，整体相符度高。\\\",\\\"original_paragraph_text\\\":\\\"发布时间为 2025-05-20 05:01:58\\\\n当地时间 5 月 19 日下午，在 2025 年国际乒联多哈世界乒乓球锦标赛混双 1/16 决赛中，中国选手王楚钦的球拍在赛前检测环节出现受损情况。\\\",\\\"paragraph_identifier\\\":\\\"p_1\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":90},{\\\"comparison_details\\\":\\\"原始段落中关于国际乒联发布声明、双方重视并开会交流以及参会人员等信息与官方报道完全一致。\\\",\\\"justification\\\":\\\"内容与官方报道高度一致，详细说明了事件处理会议的相关信息。\\\",\\\"original_paragraph_text\\\":\\\"混双开赛前王楚钦球拍出现突发情况国际乒联（ITTF）就此事件发布声明。声明表示，国际乒联与中国乒协对此高度重视，在当日全部比赛结束后，国际乒联与中国乒协就该事件举行了特别会议进行沟通交流。中国乒协主席王励勤、中国乒协秘书长何潇、国际乒联竞赛团队、裁判团队以及球拍检测团队负责人参加本次会议。\\\",\\\"paragraph_identifier\\\":\\\"p_2\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":95},{\\\"comparison_details\\\":\\\"原始段落中中国乒协的抗议、申诉及相关行动的描述与官方报道一致。\\\",\\\"justification\\\":\\\"准确描述了中国乒协抗议、申诉及相关行动，与官方报道一致。\\\",\\\"original_paragraph_text\\\":\\\"中国乒协提出抗议、申诉提出三点意见中国乒协主席王励勤表达了对该事件的关切，详细阐述了事件发生后中国乒协所采取的行动，包括第一时间询问运动员、教练员情况，并与工作人员进行交流，同时代表中国乒协就球拍检测受损事件提出抗议以及申诉，要求调取监控并且要求调查事件原因。\\\",\\\"paragraph_identifier\\\":\\\"p_3\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":95},{\\\"comparison_details\\\":\\\"原始段落中中国乒协的三点意见及国际乒联的回应与官方报道完全一致。\\\",\\\"justification\\\":\\\"完整准确地记录了中国乒协三点意见及国际乒联的回应，与官方报道几乎无差异。\\\",\\\"original_paragraph_text\\\":\\\"为避免该类事件再次发生，中国乒协提出三点意见，国际乒联一一进行回应。\\\\n——中国乒协希望在此事件之后，能够由工作人员全程跟随球拍检测并确保没有任何无关人员可以接触到检测后的球拍。国际乒联表示，根据赛事规则，允许各支球队派一名工作人员全程跟随。\\\\n——中国乒协希望后续赛事更换更大且更安全的球拍检测容器。国际乒联表示，在该事件发生后，已第一时间要求组委会提供 A4 尺寸的大信封，并要求所有裁判员在工作过程中小心谨慎对待球拍，同时强调球拍检测团队的操作程序是正确的。\\\\n——中国乒协要求球拍检测过程全程录像。国际乒联表示从本次世乒赛实际操作角度，全程录像暂时无法实现。国际乒联将在未来比赛过程逐步推进。\\\",\\\"paragraph_identifier\\\":\\\"p_4\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":98},{\\\"comparison_details\\\":\\\"原始段落中双方达成的两点共识与官方报道一致。\\\",\\\"justification\\\":\\\"准确阐述了双方达成的共识，与官方报道一致。\\\",\\\"original_paragraph_text\\\":\\\"国际乒联与中国乒协达成两点共识经过双方充分讨论，国际乒联与中国乒协还达成以下共识： 国际乒联与场馆方确认是否有监控后及时反馈。国际乒联将继续深入调查球拍受损原因，并形成书面调查报告。\\\",\\\"paragraph_identifier\\\":\\\"p_5\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":95},{\\\"comparison_details\\\":\\\"原始段落中国际乒联声明的内容与官方报道一致。\\\",\\\"justification\\\":\\\"准确传达了国际乒联声明的核心内容，与官方报道相符。\\\",\\\"original_paragraph_text\\\":\\\"国际乒联在声明中表示，该组织一直致力于维护赛事的公平公正，并将以此次事件为契机，进一步完善赛事组织和管理工作，加强对运动员装备的保护，确保类似事件不再发生。同时，感谢中国乒协及广大运动员、教练员、球迷对国际乒联工作的理解与支持，共同努力推动乒乓球运动的健康发展。\\\",\\\"paragraph_identifier\\\":\\\"p_6\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":95},{\\\"comparison_details\\\":\\\"官方报道中未提及孙颖莎/王楚钦比赛晋级的相关内容。\\\",\\\"justification\\\":\\\"该段落内容在官方报道中未出现，与官方报道无关。\\\",\\\"original_paragraph_text\\\":\\\"更多阅读孙颖莎/王楚钦 3 比 0 横扫 晋级混双 16 强北京时间 5 月 19 日，在 2025 年多哈世乒赛混双第二轮比赛中，孙颖莎/王楚钦 3 比 0 战胜巴西组合雨果/高桥·布鲁娜，晋级混双 16 强。\\\",\\\"paragraph_identifier\\\":\\\"p_7\\\",\\\"retrieved_official_source_url\\\":\\\"http://news.china.com.cn/2025-05/20/content_117884195.shtml\\\",\\\"score\\\":0}]\"}","debug_url":"https://www.coze.cn/work_flow?execute_id=7506734016290160674&space_id=7496096115306315813&workflow_id=7506442800905568306&execute_mode=2","msg":"Success","token":19590}
```