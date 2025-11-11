# 1. OpenJDK 21 이미지 사용
FROM openjdk:21-jdk-slim

# 2. 작업 디렉토리 생성
WORKDIR /backend

# 3. 프로젝트의 build.gradle, settings.gradle, gradle 폴더 등을 복사
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle

# 4. 의존성 미리 받아오기 (캐시 최적화)
RUN ./gradlew build -x test || return 0

# 5. 전체 소스 복사
COPY . .

# 6. 다시 빌드 (실제 애플리케이션 포함)
RUN ./gradlew build -x test

# 7. 빌드된 JAR 파일 경로 지정 (build/libs 아래 생성된 JAR)
# 보통은 build/libs/*.jar 하나만 생성됨
CMD ["java", "-jar", "build/libs/truvel-0.0.1-SNAPSHOT.jar"]
