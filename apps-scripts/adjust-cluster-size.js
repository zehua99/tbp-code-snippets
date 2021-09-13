import time
import threading
import http.server
import random
import json
import digitalocean

SECRET = '[REDACTED]'

BEARER = '[REDACTED]'
manager = digitalocean.Manager(token=BEARER)
keys = manager.get_all_sshkeys()
baseApi = digitalocean.baseapi.BaseAPI(token=manager.token)

projects = manager.get_all_projects()
project = [project for project in projects if project.name == 'TBP'][0]

lbs = manager.get_all_load_balancers()
lb = [lb for lb in lbs if lb.name == 'TBP'][0]

droplets = manager.get_all_droplets(tag_name='lb')
droplet_ids = set([droplet.id for droplet in droplets])
main_droplet = [droplet for droplet in droplets if 'main' in droplet.tags][0]


def refresh_lb():
  lb.load()
  for droplet_id in droplet_ids:
    if droplet_id not in lb.droplet_ids:
      try:
        lb.add_droplets([droplet_id])
      except Exception:
        continue
  for droplet_id in lb.droplet_ids:
    if droplet_id not in droplet_ids:
      droplet_ids.add(droplet_id)


def wait_for_droplet(droplet):
  while True:
    actions = droplet.get_actions()
    count = 0
    for action in actions:
      if action.status == 'completed':
        count += 1
        continue
      action.load()
      if action.status == 'completed':
        count += 1
      else:
        break
    if count == len(actions):
      return
    time.sleep(5)
    

def add_droplets(num=1):
  snapshots = manager.get_all_snapshots()
  snapshots = [snapshot for snapshot in snapshots if snapshot.name == 'tbp-snapshot']
  snapshots.sort(key=lambda x: x.created_at, reverse=True)
  snapshot = snapshots[0]
  tag = digitalocean.Tag(token=manager.token, name='lb')
  tag.create()
  droplets = []
  for _ in range(num):
    droplet = digitalocean.Droplet(token=manager.token,
                                   region=main_droplet.region['slug'],
                                   size_slug='s-1vcpu-2gb',
                                   ssh_keys=keys,
                                   vpc_uuid=main_droplet.vpc_uuid,
                                   image=snapshot.id,
                                   name='tbp-worker',
                                   monitoring=True,
                                   backup=False)
    droplet.create()
    droplets.append(droplet)
    droplet_ids.add(droplet.id)
  tag.add_droplets([droplet.id for droplet in droplets])
  def add_droplet(droplet):
    wait_for_droplet(droplet)
    lb.add_droplets([droplet.id])
  for droplet in droplets:
    threading.Thread(target=add_droplet, args=(droplet,)).start()
  return droplets


def remove_droplets(num=1):
  worker_ids = set([droplet_id for droplet_id in droplet_ids if droplet_id != main_droplet.id])
  for _ in range(num):
    if len(worker_ids) == 0:
      return
    worker_id = random.sample(list(worker_ids), 1)[0]
    def remove_droplet(worker_id):
      try:
        print('Delete droplet', worker_id)
        worker = manager.get_droplet(worker_id)
        wait_for_droplet(worker)
        if worker_id in droplet_ids:
          droplet_ids.remove(worker_id)
        worker.destroy()
      except Exception:
        return
    threading.Thread(target=remove_droplet, args=(worker_id,)).start()


def get_cpu_usage(droplet):
  timestamp = int(time.time())
  
  res = baseApi.get_data(url='monitoring/metrics/droplet/cpu',
                        type=digitalocean.baseapi.GET,
                        params={
                          'host_id': droplet.id,
                          'start': timestamp - 90,
                          'end': timestamp
                        })
  res = res['data']['result']
  prev_metrics = {}
  metrics = {}
  for r in res:
    prev_metrics[r['metric']['mode']] = float(r['values'][0][1])
    metrics[r['metric']['mode']] = float(r['values'][1][1])

  def get_stats(metrics):
    idle = metrics['idle'] + metrics['iowait']
    non_idle = metrics['user'] + metrics['nice'] + metrics['system'] + \
      metrics['irq'] + metrics['softirq'] + metrics['steal']
    return idle, non_idle

  prev_idle, prev_non_idle = get_stats(prev_metrics)
  idle, non_idle = get_stats(metrics)
  idle -= prev_idle
  non_idle -= prev_non_idle
  if idle + non_idle == 0:
    return 0
  return non_idle / (idle + non_idle)


def listen():
  class RequestHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
      try:
        length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(length).decode('utf-8'))
        if 'upperBound' not in body or 'lowerBound' not in body or \
          'secret' not in body or body['secret'] != SECRET:
          self.send_response(400, 'Wrong request.')
        else:
          with open('do-manage', 'w') as fs:
            fs.write(str(body['lowerBound']) + ',' + str(body['upperBound']))
          self.send_response(201, 'Yay.')
        self.end_headers()
      except Exception:
        return

  server_address = ('0.0.0.0', 1885)
  httpd = http.server.HTTPServer(server_address, RequestHandler)
  httpd.serve_forever()


def get_bounds():
  try:
    with open('do-manage') as fs:
      text = fs.readline()
      parts = text.strip().split(',')
      lower, upper = int(parts[0]), int(parts[1])
      if upper < lower:
        return 1, -1
      return lower, upper
  except Exception as e:
    print(e)
    return 1, -1


if __name__ == "__main__":
  threading.Thread(target=listen).start()
  while True:
    refresh_lb()
    cpu_usage = get_cpu_usage(main_droplet)
    print('CPU Usage:', cpu_usage)
    if cpu_usage > .8:
      target_droplet_count = len(droplet_ids) + 2
    elif cpu_usage < .5:
      target_droplet_count = len(droplet_ids) - 1
    lower, upper = get_bounds()
    if upper > 0:
      target_droplet_count = min(target_droplet_count, upper)
    target_droplet_count = max(target_droplet_count, lower)
    diff = target_droplet_count - len(droplet_ids)

    if diff < 0:
      print('Removing', -diff, 'droplets')
      remove_droplets(num=-diff)
      time.sleep(120)
    elif diff > 0:
      print('Adding', diff, 'droplets')
      add_droplets(num=diff)
      time.sleep(180)
    else:
      print(len(droplet_ids), 'droplets running')
      time.sleep(10)
