from collections import defaultdict


class ConversationMemory:

    def __init__(self):
        self.memory = defaultdict(list)

    def add_message(self, session_id: str, role: str, content: str):
        self.memory[session_id].append(
            {
                "role": role,
                "content": content
            }
        )

    def get_history(self, session_id: str):
        return self.memory.get(session_id, [])

    def clear(self, session_id: str):
        self.memory.pop(session_id, None)


conversation_memory = ConversationMemory()