FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Lawyer.sln .
COPY Lawyer/Lawyer.csproj Lawyer/
COPY Lawyer.Application/Lawyer.Application.csproj Lawyer.Application/
COPY Lawyer.Core/Lawyer.Core.csproj Lawyer.Core/
COPY Lawyer.Infrastructure/Lawyer.Infrastructure.csproj Lawyer.Infrastructure/
RUN dotnet restore Lawyer/Lawyer.csproj

COPY . .
RUN dotnet publish Lawyer/Lawyer.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        tesseract-ocr \
        libleptonica-dev \
    && ARCH_LIB_DIR="$(dirname "$(find /usr/lib -name 'libtesseract.so.5' | head -n 1)")" \
    && ln -sf "${ARCH_LIB_DIR}/libtesseract.so.5" "${ARCH_LIB_DIR}/libtesseract50.so" \
    && ln -sf "${ARCH_LIB_DIR}/liblept.so.5" "${ARCH_LIB_DIR}/libleptonica-1.82.0.so" \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY --from=build /app/publish .

ENV LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu:/app:/app/x64:/app/runtimes/linux-x64/native"

RUN ARCH_LIB_DIR="$(dirname "$(find /usr/lib -name 'libtesseract.so.5' | head -n 1)")" \
    && LIBDL_PATH="$(find /usr/lib /lib -name 'libdl.so.2' | head -n 1)" \
    && mkdir -p /app/x64 /app/runtimes/linux-x64/native \
    && for DIR in /app /app/x64 /app/runtimes/linux-x64/native; do \
         ln -sf "${ARCH_LIB_DIR}/libtesseract50.so" "${DIR}/libtesseract50.so" \
         && ln -sf "${ARCH_LIB_DIR}/libleptonica-1.82.0.so" "${DIR}/libleptonica-1.82.0.so" \
         && ln -sf "${LIBDL_PATH}" "${DIR}/libdl.so" ; \
       done

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["dotnet", "Lawyer.dll"]
