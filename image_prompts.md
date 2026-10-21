# 기후 불평등 게임 — 이미지 생성 프롬프트 (GPT용)

총 36장: 캐릭터 16장 + 재난 20장.
만든 그림은 아래 **파일 이름 그대로** `images/` 폴더에 넣으면 게임이 자동으로 불러옵니다.
그림이 없으면 캐릭터는 색 배경 + 이름 첫 글자, 재난은 이모지로 표시되므로 그림 없이도 게임은 돌아갑니다.

---

## 1. 캐릭터 16장 (정사각형 1:1, 512×512 이상, png)

### 공통 프롬프트 (매번 맨 앞에 붙이기)

```
Flat vector illustration, thick black outlines, highly saturated vivid colors, sticker style,
cute but not childish, middle-school game character, front-facing upper body, bright confident
smile, plain solid background in the character's signature color, no text, no logo, square 1:1.
Every character must look equally proud and cheerful — never pitiful.
Keep the exact same art style for all 16 characters so they look like one set.
```

### 캐릭터별 설명 (공통 프롬프트 뒤에 한 줄씩 붙이기)

| 파일 이름 | 프롬프트 |
| --- | --- |
| `char_01.png` | 17-year-old boy from Qatar, white thobe and ghutra headscarf, gold watch, confident grin. Background #FFC300 (gold). |
| `char_02.png` | 14-year-old Australian girl, blonde ponytail, surf t-shirt, sunglasses pushed up on head. Background #FF5E78 (coral). |
| `char_03.png` | 15-year-old Korean boy, neat school uniform with tie, smartphone in hand. Background #00B4FF (sky blue). |
| `char_04.png` | 19-year-old French young man seated in a wheelchair, beret, striped shirt, friendly wave. Background #8E44FF (violet). |
| `char_05.png` | 78-year-old German woman, white hair bun, cardigan, reading glasses, warm smile. Background #1DE9B6 (mint). |
| `char_06.png` | 16-year-old Black American girl from Houston, box braids, hoodie, headphones around neck. Background #FF2DAA (magenta). |
| `char_07.png` | 15-year-old Inuit boy from arctic Canada, fur-trimmed parka hood, rosy cheeks. Background #40E0FF (ice blue). |
| `char_08.png` | 82-year-old Korean farmer grandfather, straw hat, work vest, kind wrinkled smile. Background #9CFF2E (yellow-green). |
| `char_09.png` | 11-year-old Indian boy from Delhi, bright eyes, simple t-shirt, cheerful. Background #FF7A00 (orange). |
| `char_10.png` | 13-year-old Nepali girl from a mountain village, red scarf, holding a small water jug. Background #FF1E56 (hot pink). |
| `char_11.png` | 14-year-old Bangladeshi boy from a fishing village, checked lungi, fishing net over shoulder. Background #00E5C8 (teal). |
| `char_12.png` | 12-year-old girl from Tuvalu, flower crown, island dress, big smile. Background #C6FF00 (lime). |
| `char_13.png` | 15-year-old Filipino girl who is deaf, hearing aid visible, hands making a sign-language gesture, bright expression. Background #FFE600 (yellow). |
| `char_14.png` | 12-year-old Maasai boy from northern Kenya, red shuka cloth, beaded necklace, proud posture. Background #FF3B30 (red). |
| `char_15.png` | 13-year-old Indigenous boy from the Brazilian Amazon, feather headband, face paint stripes. Background #00D26A (green). |
| `char_16.png` | 14-year-old Syrian refugee girl in Jordan, hijab, carrying a younger sibling on her back, gentle confident smile. Background #2962FF (blue). |

> 팁: 한 번에 한 장씩 만들고, 첫 장이 마음에 들면 "이 스타일 그대로"라고 덧붙여 다음 장을 요청하세요.

---

## 2. 재난 20장 (정사각형 1:1, 512×512 이상, png)

### 공통 프롬프트 (매번 맨 앞에 붙이기)

```
Flat vector illustration, thick black outlines, highly saturated vivid colors, sticker style,
same art style as the character set, no people's faces in close-up, no gore, no blood,
no text, no logo, square 1:1. Dramatic but not scary — suitable for middle-school students.
```

### 재난별 설명

| 파일 이름 | 프롬프트 |
| --- | --- |
| `disaster_01.png` | Deadly heatwave: a city street under a huge blazing orange sun, heat waves rising from asphalt, a thermometer reading 48°C. |
| `disaster_02.png` | Monsoon flood and landslide: a Himalayan mountain village, a slope collapsing in brown mud under heavy rain. |
| `disaster_03.png` | Cyclone storm surge: a giant wave crashing over a coastal fishing village, palm trees bent by wind, dark swirling sky. |
| `disaster_04.png` | Evacuation shelter: rows of tents and mats inside a gym, dim night lighting, people as simple silhouettes, a lone flashlight. |
| `disaster_05.png` | Great drought: cracked dry earth, an empty well, a thin cow, a price tag on a loaf of bread showing "x2". |
| `disaster_06.png` | Mega wildfire: a forest edge in flames with a wall of orange smoke, sky turned amber, a road with a car fleeing. |
| `disaster_07.png` | Sea-level rise: a tiny coral island almost swallowed by turquoise sea, a palm tree and a hut with water at the doorstep. |
| `disaster_08.png` | Post-flood epidemic: stagnant brown puddles, oversized mosquitoes, a crowded clinic with a red cross sign. |
| `disaster_09.png` | Cold snap and blackout: a frozen suburban street at night, snapped power lines, dark houses, one candle in a window. |
| `disaster_10.png` | Climate refugees on the move: a long line of people with bags walking toward a tall border fence under a hot sun. |
| `disaster_11.png` | Typhoon river flood: a city riverside slum half underwater, rooftops poking out, a siren speaker on a pole. |
| `disaster_12.png` | Dried-up well and expensive water: a girl's silhouette carrying water jugs on a long dusty path, a bottled-water price sign. |
| `disaster_13.png` | Heat labor ban: a construction site at noon, "NO WORK 12–3 PM" sign, scaffolding, blazing sun, empty water bottle. |
| `disaster_14.png` | Melting sea ice: thin cracked ice floes on an arctic sea, a sled and dog waiting at the edge, pale sun. |
| `disaster_15.png` | Deforestation fire: a rainforest edge burning next to a bulldozer and a new fence, green jungle on one side, ash on the other. |
| `disaster_16.png` | Food price riot: a city square with a crowd of silhouettes, a shuttered bakery, a sign "BREAD x3". |
| `disaster_17.png` | School closed by disaster: a school building with a "CLOSED" sign, classrooms used as a shelter, empty playground. |
| `disaster_18.png` | Relief-money application: a laptop screen with an online form, a stack of documents, a stamp reading "REJECTED" and one "APPROVED". |
| `disaster_19.png` | Crop failure: a scorched greenhouse with wilted brown vegetables, a sun above, a farmer's straw hat on a fence post. |
| `disaster_20.png` | Climate compensation summit: a round conference table with many flags, big microphones on one side and tiny ones on the other. |
