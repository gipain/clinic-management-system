# Stage 1: Build
FROM eclipse-temurin:17-jdk as builder
WORKDIR /build

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy entire project
COPY . .

# Build all modules
RUN mvn clean package -DskipTests

# Stage 2: Runtime - API Gateway
FROM eclipse-temurin:17-jre as api-gateway-runtime
WORKDIR /app
COPY --from=builder /build/api-gateway/target/api-gateway-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 3: Runtime - Patient Service
FROM eclipse-temurin:17-jre as patient-service-runtime
WORKDIR /app
COPY --from=builder /build/patient-service/target/patient-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 4: Runtime - Appointment Service
FROM eclipse-temurin:17-jre as appointment-service-runtime
WORKDIR /app
COPY --from=builder /build/appointment-service/target/appointment-service-*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 5: Runtime - Treatment Service
FROM eclipse-temurin:17-jre as treatment-service-runtime
WORKDIR /app
COPY --from=builder /build/treatment-service/target/treatment-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 6: Runtime - Billing Service
FROM eclipse-temurin:17-jre as billing-service-runtime
WORKDIR /app
COPY --from=builder /build/billing-service/target/billing-service-*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
