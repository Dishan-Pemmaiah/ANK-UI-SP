# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY anjk_api.csproj ./
RUN dotnet restore ./anjk_api.csproj

COPY . ./
RUN dotnet publish ./anjk_api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

# Render injects PORT at runtime; fallback to 10000 for local container runs.
ENTRYPOINT ["sh", "-c", "dotnet anjk_api.dll --urls http://0.0.0.0:${PORT:-10000}"]
