# 001-Java-Basic Translation Notes

영어판에서 직역이 어색하거나 의미 왜곡 가능성이 있어 의도적으로 초월번역한 부분을 기록한다.

## 002 Intro

- Scope: narration, intro center text
- KOR original narration: `자료형이란 자료의 형태, 즉 데이터의 형태입니다.`
- ENG final narration: `A data type tells us what kind of value it is.`
- KOR original screen text: `자료 == 데이터`
- ENG final screen text: `kind of value`
- Reason: 한국어의 `자료/데이터`는 거의 같은 말로 받아들여질 수 있지만, 이를 영어로 직역하면 `data`와 `shape` 같은 부정확한 등식으로 흐르기 쉽다. 영어판은 `data type`의 입문 개념을 더 정확하게 전달하는 쪽으로 의미 번역했다.

## 001 Interpret

- Scope: narration, scene title
- KOR original wording: `변수의 해석`, `공간으로 해석`, `값으로 해석`
- ENG final wording: `How to Read a Variable`, `read as storage space`, `read as a value`
- Reason: 한국어의 `해석`과 `공간`은 초급 문맥에서 자연스럽지만, 영어에서 `interpreted as space`는 번역투가 강하다. 영어판은 같은 설명 흐름을 유지하면서도 `read`와 `storage space`를 써서 강의체로 다듬었다.

## 004 Comparison Operators

- Scope: narration
- KOR original wording: `크거나 같다`, `작거나 같다`
- ENG final wording: `greater than or equal to`, `less than or equal to`
- Reason: `at least`, `at most`는 수학적으로는 가능하지만 비교 연산자 설명에서는 초급 학습자에게 덜 직관적이다. 연산자 의미를 직접 읽어 주는 쪽으로 바꿨다.

## 007 Switch

- Scope: narration, scene title, on-screen labels
- KOR original concept: `switch문`
- ENG final wording: `switch`, `switch statement`, `switch with arrow syntax`
- Reason: 영어판에서 `switch expression`을 반복하면 Java의 특정 문법만 가리키는 것처럼 들릴 수 있다. 전체 개념은 `switch statement`로 두고, 화살표 문법을 보여주는 장면만 별도 라벨로 풀어 썼다.

## 009 For Loop

- Scope: narration, scene titles, on-screen explanation
- KOR original concept: `for문`
- ENG final wording: `for loop`, `for Loop Syntax`, `for Loop Execution`
- Reason: 영어권 초급 강의에서는 `for statement`보다 `for loop`가 훨씬 직관적이고 흔하다. 용어를 통일해서 강의 흐름을 더 자연스럽게 만들었다.

## 012 Return

- Scope: narration, thumbnail text, scene title, cards, on-screen labels
- KOR original concept: `return은 결과를 돌려준다`
- ENG final wording: `send a value back`, `What Does return Do?`, `store it in a variable`
- Reason: `send a result back out` 같은 직역은 영어 강의체로 어색하다. 영어판은 `caller`, `value`, `store it`처럼 실제 프로그래밍 설명에서 많이 쓰는 표현으로 다듬었다.
