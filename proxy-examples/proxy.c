// Simple TCP Proxy in C
// For demonstration only. Not production ready.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define LISTEN_PORT 8080
#define TARGET_IP "93.184.216.34" // example.com
#define TARGET_PORT 80

int main() {
    int listen_fd, client_fd, target_fd;
    struct sockaddr_in listen_addr, client_addr, target_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[4096];
    ssize_t n;

    listen_fd = socket(AF_INET, SOCK_STREAM, 0);
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(LISTEN_PORT);
    bind(listen_fd, (struct sockaddr*)&listen_addr, sizeof(listen_addr));
    listen(listen_fd, 5);
    printf("Proxy listening on port %d\n", LISTEN_PORT);

    while (1) {
        client_fd = accept(listen_fd, (struct sockaddr*)&client_addr, &client_len);
        target_fd = socket(AF_INET, SOCK_STREAM, 0);
        target_addr.sin_family = AF_INET;
        target_addr.sin_port = htons(TARGET_PORT);
        inet_pton(AF_INET, TARGET_IP, &target_addr.sin_addr);
        connect(target_fd, (struct sockaddr*)&target_addr, sizeof(target_addr));

        n = read(client_fd, buffer, sizeof(buffer));
        write(target_fd, buffer, n);
        n = read(target_fd, buffer, sizeof(buffer));
        write(client_fd, buffer, n);

        close(client_fd);
        close(target_fd);
    }
    return 0;
}
