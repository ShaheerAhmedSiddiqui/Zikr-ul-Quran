package com.zikrulquran.util;

import com.zikrulquran.model.PlaylistItem;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.List;
import java.util.ArrayList;

public class PlaylistLinkedList implements Iterable<PlaylistItem> {

    // Node class for LinkedList
    private static class PlaylistNode {
        PlaylistItem data;
        PlaylistNode next;
        PlaylistNode prev;

        PlaylistNode(PlaylistItem data) {
            this.data = data;
            this.next = null;
            this.prev = null;
        }
    }

    private PlaylistNode head;
    private PlaylistNode tail;
    private int size;

    // Constructor
    public PlaylistLinkedList() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // Add item to the end of playlist
    public void add(PlaylistItem item) {
        PlaylistNode newNode = new PlaylistNode(item);

        if (head == null) {
            head = tail = newNode;
        } else {
            tail.next = newNode;
            newNode.prev = tail;
            tail = newNode;
        }
        size++;
    }

    // Add item at specific position
    public void add(int position, PlaylistItem item) {
        validatePositionForAdd(position);

        if (position == size) {
            add(item);
            return;
        }

        PlaylistNode newNode = new PlaylistNode(item);

        if (position == 0) {
            newNode.next = head;
            head.prev = newNode;
            head = newNode;
        } else {
            PlaylistNode current = getNode(position);
            PlaylistNode previous = current.prev;

            previous.next = newNode;
            newNode.prev = previous;
            newNode.next = current;
            current.prev = newNode;
        }
        size++;
    }

    // Add all items from a list
    public void addAll(List<PlaylistItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        for (PlaylistItem item : items) {
            add(item);
        }
    }

    // Remove item by position
    public PlaylistItem remove(int position) {
        validatePosition(position);

        PlaylistNode toRemove;

        if (position == 0) {
            toRemove = head;
            head = head.next;
            if (head != null) {
                head.prev = null;
            } else {
                tail = null;
            }
        } else if (position == size - 1) {
            toRemove = tail;
            tail = tail.prev;
            tail.next = null;
        } else {
            toRemove = getNode(position);
            PlaylistNode previous = toRemove.prev;
            PlaylistNode next = toRemove.next;

            previous.next = next;
            next.prev = previous;
        }

        size--;
        return toRemove.data;
    }

    // Remove item by surah ID
    public boolean removeBySurahId(Integer surahId) {
        PlaylistNode current = head;
        int position = 0;

        while (current != null) {
            if (current.data.getSurah().getSurahId().equals(surahId)) {
                remove(position);
                return true;
            }
            current = current.next;
            position++;
        }
        return false;
    }

    // Remove all items matching surah ID
    public int removeAllBySurahId(Integer surahId) {
        int removedCount = 0;
        PlaylistNode current = head;
        int position = 0;

        while (current != null) {
            PlaylistNode next = current.next;
            if (current.data.getSurah().getSurahId().equals(surahId)) {
                remove(position);
                removedCount++;
                // Since we removed current item, position doesn't increment
            } else {
                position++;
            }
            current = next;
        }
        return removedCount;
    }

    // Get item by position
    public PlaylistItem get(int position) {
        validatePosition(position);
        return getNode(position).data;
    }

    // Get item by surah ID
    public PlaylistItem getBySurahId(Integer surahId) {
        PlaylistNode current = head;

        while (current != null) {
            if (current.data.getSurah().getSurahId().equals(surahId)) {
                return current.data;
            }
            current = current.next;
        }
        return null;
    }

    // Get position of item by surah ID
    public int getPositionBySurahId(Integer surahId) {
        PlaylistNode current = head;
        int position = 0;

        while (current != null) {
            if (current.data.getSurah().getSurahId().equals(surahId)) {
                return position;
            }
            current = current.next;
            position++;
        }
        return -1;
    }

    // Check if surah already exists in playlist
    public boolean containsSurah(Integer surahId) {
        return getBySurahId(surahId) != null;
    }

    // Check if playlist contains specific item
    public boolean contains(PlaylistItem item) {
        PlaylistNode current = head;

        while (current != null) {
            if (current.data.equals(item)) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // Move item to different position
    public void move(int fromPosition, int toPosition) {
        validatePosition(fromPosition);
        validatePosition(toPosition);

        if (fromPosition == toPosition) return;

        PlaylistItem item = remove(fromPosition);

        if (toPosition > fromPosition) {
            add(toPosition - 1, item);
        } else {
            add(toPosition, item);
        }
    }

    // Swap two items
    public void swap(int position1, int position2) {
        validatePosition(position1);
        validatePosition(position2);

        if (position1 == position2) return;

        // Ensure position1 is always smaller for simpler logic
        if (position1 > position2) {
            int temp = position1;
            position1 = position2;
            position2 = temp;
        }

        PlaylistNode node1 = getNode(position1);
        PlaylistNode node2 = getNode(position2);

        // Swap the data (simpler than swapping nodes)
        PlaylistItem tempData = node1.data;
        node1.data = node2.data;
        node2.data = tempData;
    }

    // Get all items as list
    public List<PlaylistItem> toList() {
        List<PlaylistItem> list = new ArrayList<>();
        PlaylistNode current = head;

        while (current != null) {
            list.add(current.data);
            current = current.next;
        }
        return list;
    }

    // Get first item
    public PlaylistItem getFirst() {
        if (head == null) {
            throw new NoSuchElementException("List is empty");
        }
        return head.data;
    }

    // Get last item
    public PlaylistItem getLast() {
        if (tail == null) {
            throw new NoSuchElementException("List is empty");
        }
        return tail.data;
    }

    // Helper method to get node at position
    private PlaylistNode getNode(int position) {
        validatePosition(position);

        PlaylistNode current;
        if (position < size / 2) {
            // Start from head
            current = head;
            for (int i = 0; i < position; i++) {
                current = current.next;
            }
        } else {
            // Start from tail
            current = tail;
            for (int i = size - 1; i > position; i--) {
                current = current.prev;
            }
        }
        return current;
    }

    // Position validation for get/remove operations
    private void validatePosition(int position) {
        if (position < 0 || position >= size) {
            throw new IndexOutOfBoundsException("Position: " + position + ", Size: " + size);
        }
    }

    // Position validation for add operations
    private void validatePositionForAdd(int position) {
        if (position < 0 || position > size) {
            throw new IndexOutOfBoundsException("Position: " + position + ", Size: " + size);
        }
    }

    // Iterator implementation
    @Override
    public Iterator<PlaylistItem> iterator() {
        return new PlaylistIterator();
    }

    private class PlaylistIterator implements Iterator<PlaylistItem> {
        private PlaylistNode current = head;

        @Override
        public boolean hasNext() {
            return current != null;
        }

        @Override
        public PlaylistItem next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            PlaylistItem item = current.data;
            current = current.next;
            return item;
        }

        @Override
        public void remove() {
            throw new UnsupportedOperationException("Remove operation not supported by this iterator");
        }
    }

    // Utility methods
    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public void clear() {
        head = tail = null;
        size = 0;
    }

    public void removeAll() {
        clear();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("PlaylistLinkedList [");
        PlaylistNode current = head;
        while (current != null) {
            sb.append(current.data.getSurah().getSurahNameEn())
                    .append(" (")
                    .append(current.data.getSurah().getSurahId())
                    .append(")");
            if (current.next != null) sb.append(" -> ");
            current = current.next;
        }
        sb.append("]");
        return sb.toString();
    }

    // Additional debug information
    public String toDetailedString() {
        StringBuilder sb = new StringBuilder();
        sb.append("PlaylistLinkedList {")
                .append("\n  Size: ").append(size)
                .append("\n  Empty: ").append(isEmpty())
                .append("\n  Items: [");

        PlaylistNode current = head;
        int index = 0;
        while (current != null) {
            sb.append("\n    [").append(index).append("] ")
                    .append(current.data.getSurah().getSurahId())
                    .append(" - ")
                    .append(current.data.getSurah().getSurahNameEn())
                    .append(" (Position: ")
                    .append(current.data.getPosition())
                    .append(")");
            current = current.next;
            index++;
        }
        sb.append("\n  ]\n}");
        return sb.toString();
    }
}