# Compiler and Flags
CC = gcc
CFLAGS = -Wall -Wextra -g

# Target executable name
TARGET = elmo_scanner

# Source and Object files
SRC = scanner.c
OBJ = $(SRC:.c=.o)

# Default rule
all: $(TARGET)

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJ)

# Rule for object files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean up build files
clean:
	rm -f $(TARGET) $(OBJ)

# Run the scanner
run: all
	./$(TARGET)