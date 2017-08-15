from __future__ import division
import random
import json
import os
import argparse
import subprocess
import multiprocessing
cpu_count = multiprocessing.cpu_count()

def clip(x, min_val=0, max_val=1):
    return min(max_val, max(min_val, x))

def parse_annotation(fname):
    with open(fname, 'r') as f:
        data = json.load(f)

    if data:
        path = os.path.join(data['folder'], data['filename'])
        width, height = data['image_w_h']
        label = []
        for obj in data['objects']:
            assert obj['label'] == 'pikachu'
            x, y, w, h = obj['x_y_w_h']
            x /= width
            y /= height
            w /= width
            h /= height
            label += [0, clip(x), clip(y), clip(x + w), clip(y + h)]
        return [4, 5, width, height] + label + [path]
    return []

def list_annotations(root):
    l = [os.path.join(root, x) for x in os.listdir(root) if 'json' in x]
    return l

def split_annotations(anno, ratio):
    assert ratio < 1.0
    assert ratio > 0
    size = len(anno)
    assert size > 1
    ntrain = max(1, min(size - 1, int(round(ratio * size))))
    random.shuffle(anno)
    return anno[:ntrain], anno[ntrain:]

def save_list(annotations, fname):
    l = []
    count = 0
    for anno in annotations:
        label = parse_annotation(anno)
        if label:
            label = [count] + label
            l.append('\t'.join(str(x) for x in label))
            count += 1

    if l:
        with open(fname, 'w') as f:
            for line in l:
               f.write(line + '\n')

def parse_args():
    parser = argparse.ArgumentParser(description="Create training and test records.")
    parser.add_argument('--anno', dest='annotation_dir', type=str,
                        default='../annotations', help='annotation directory')
    parser.add_argument('--ratio', dest='train_ratio', type=float,
                        default=0.9, help='training set ratio')
    parser.add_argument('--train', dest='train_dst', type=str,
                        default='train.lst', help='training list name')
    parser.add_argument('--val', dest='val_dst', type=str,
                        default='val.lst', help='validation list name')
    parser.add_argument('--mx', dest='mxnet_dir', type=str,
                        required=True, help='mxnet root dir')
    args = parser.parse_args()
    return args

if __name__ == "__main__":
    args = parse_args()
    annos = list_annotations(args.annotation_dir)
    train, val = split_annotations(annos, args.train_ratio)
    save_list(train, args.train_dst)
    save_list(val, args.val_dst)
    subprocess.check_call(["python",
        os.path.join(args.mxnet_dir, 'tools', 'im2rec.py'),
        args.train_dst, '..', '--num-thread', str(cpu_count),
        '--shuffle', '1', '--pack-label', '1'])

    subprocess.check_call(["python",
        os.path.join(args.mxnet_dir, 'tools', 'im2rec.py'),
        args.val_dst, '..', '--num-thread', str(cpu_count),
        '--shuffle', '1', '--pack-label', '1'])
