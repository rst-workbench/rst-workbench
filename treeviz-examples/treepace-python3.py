#!/usr/bin/env python
# coding: utf-8

# In[1]:


import treepace
from treepace import Node, Tree


# In[2]:




#shop = Tree.load('shop (item (bread) item (water) item (roll) item (water))')
#pattern = '{item} < water'
#display(shop.search(pattern))


# In[3]:


leaves = [
    'Students and lecturers alike are worried about global warming and related climate change .',
     'With a clear ecological conscience and convinced that they stand on the right side of history , they cycle to their university campus , buy a vegetarian sandwich on the wayand were jointly outraged',
     'when Donald Trump pulled the US out of the Paris Climate Agreement .',
     'However , their own contribution to climate change is all too often ignored .']


# In[4]:


hilda_ascii = """
Elaboration                                   
        _______________________________|_____________                            
       |                                             S                          
       |                                             |                           
       |                                        Elaboration                     
       |                                _____________|_________________          
       |                               N                               |        
       |                               |                               |         
       |                           Background                          |        
       |                 ______________|_____________                  |         
       N                N                            S                 S        
       |                |                            |                 |         
 Students and     With a clear                  when Donald     However , their 
lecturers alike     ecological                Trump pulled the        own       
                 conscience and                                 contribution to 
  are worried     convinced that               US out of the     climate change 
  about global                                 Paris Climate                    
                  they stand on                                is all too often 
  warming and     the right side                Agreement .        ignored .    
related climate                                                                 
                  of history ,                                                  
    change .      they cycle to                                                 
                                                                                
                their university                                                
                   campus , buy                                                 
                                                                                
                  a vegetarian                                                  
                 sandwich on the                                                
                                                                                
                   wayand were                                                  
                 jointly outraged                                               
"""


# In[17]:


l0 = Node(leaves[0])
l1 = Node(leaves[1])
l2 = Node(leaves[2])
l3 = Node(leaves[0])

root = Node('Elaboration',
            [
                Node('N',
                     [Node(l0)]),
                Node('S', 
                     [Node('Elaboration',
                           [
                               Node('N',
                                    [Node('Background',
                                          [
                                              Node('N',
                                                   [Node(l1)]),
                                              Node('S',
                                                   [Node(l2)])
                                          ])]),
                               Node('S',
                                    [Node(l3)])
                           ])])
            ])

ht = Tree(root)
ht


# In[24]:


print(ht.save(treepace.IndentedText))


# In[37]:


ht.save(treepace.DotText)


# In[36]:


dt = treepace.DotText()
dt.save_tree(ht)


# In[6]:


t = Tree.load(f"Elaboration (N ({leaves[0]}) S (Elaboration (N (Background (N ({leaves[1]})) (S ({leaves[2]})))) (S ({leaves[3]}))))")


# In[7]:


Node(leaves[0])


# In[8]:


t.__str__()


# In[9]:


t.__repr__()


# In[10]:


root = Node('root',
            [Node('c1'), Node('c2',
                              [Node('subchild')])])
Tree(root)


# In[14]:


t


# In[ ]:





# In[ ]:




