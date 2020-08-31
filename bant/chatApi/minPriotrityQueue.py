class Queue:
    def __init__(self, list=[], comparator=None):
        self.item_queue = []
        if list:
            self.from_list(list, comparator=comparator)


    def __str__(self):
        list = [str(item) for item in self.item_queue]
        return str(list)

    def insert(self, item, comparator=None):
        inserted = False
        for i in range(-1, -len(self.item_queue)-1, -1):
            val = item
            if comparator:
                if comparator(item, self.item_queue[i]) <= 0:
                    val, self.item_queue[i] = self.item_queue[i], val
                    self.item_queue.insert(i + len(self.item_queue), val)
                    inserted = True
                    break
            else:
                if item <= self.item_queue[i]:
                    val, self.item_queue[i] = self.item_queue[i], val
                    self.item_queue.insert(i+len(self.item_queue), val)
                    inserted = True
                    break

        if not inserted:
            self.item_queue.insert(0, item)

    def from_list(self, list, comparator=None):
        for item in list:
            self.insert(item, comparator)

    def minimum(self):
        return self.item_queue[len(self.item_queue)-1]

    def extract_min(self):
        if self.item_queue:
            return self.item_queue.pop()

    def __len__(self):
        return len(self.item_queue)

    def __add__(self, other):
        res = Queue(self.item_queue+other.item_queue)
        return res

    def __iter__(self):
        for item in self.item_queue:
            yield item
